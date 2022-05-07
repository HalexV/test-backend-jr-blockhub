import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsModule } from '../projects/projects.module';
import { ProjectsMongoRepository } from '../projects/repositories/projects.mongo.repository';
import { NotFoundError } from '../errors';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.schema';
import { EmployeesMongoRepository } from './repositories/employees.mongo.repository';

class EmployeeModelStub {
  static async findByIdAndUpdate() {
    return {
      name: 'test1',
      post: 'tester1',
      admission: new Date('2020-01-02'),
      active: false,
    };
  }
}

const CONSTANTS = {
  VALID_EMPLOYEE: {
    id: 'any',
    name: 'test',
    post: 'tester',
    admission: new Date('2020-01-01'),
    active: true,
    projects: [],
  },
  VALID_UPDATED_EMPLOYEE: {
    id: 'any',
    name: 'new test',
    post: 'new tester',
    admission: new Date('2020-01-20'),
    active: false,
    projects: ['any_id', 'any_id'],
  },
  VALID_PROJECT: {
    name: 'test project',
    description: 'test description',
    startDate: new Date('2022-01-01'),
    endDate: new Date('2022-01-02'),
    active: true,
  },
};

class EmployeesMongoRepositoryStub {
  async create() {
    return CONSTANTS.VALID_EMPLOYEE;
  }

  async update() {
    return CONSTANTS.VALID_UPDATED_EMPLOYEE;
  }

  async findOneByName() {
    return CONSTANTS.VALID_EMPLOYEE;
  }

  async findAll() {
    return [CONSTANTS.VALID_EMPLOYEE];
  }

  async findById() {
    return CONSTANTS.VALID_EMPLOYEE;
  }
}

class ProjectsMongoRepositoryStub {
  async findById() {
    return CONSTANTS.VALID_PROJECT;
  }
}

describe('EmployeesService', () => {
  let employeeService: EmployeesService;
  let employeesMongoRepository: EmployeesMongoRepository;
  let projectsMongoRepository: ProjectsMongoRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: EmployeesMongoRepository,
          useValue: new EmployeesMongoRepositoryStub(),
        },
        {
          provide: ProjectsMongoRepository,
          useValue: new ProjectsMongoRepositoryStub(),
        },
      ],
    }).compile();

    employeeService = module.get<EmployeesService>(EmployeesService);
    employeesMongoRepository = module.get<EmployeesMongoRepository>(
      EmployeesMongoRepository,
    );
    projectsMongoRepository = module.get<ProjectsMongoRepository>(
      ProjectsMongoRepository,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(employeeService).toBeDefined();
    expect(employeesMongoRepository).toBeDefined();
    expect(projectsMongoRepository).toBeDefined();
  });

  describe('create', () => {
    it('should be able to create an employee', async () => {
      const expected = CONSTANTS.VALID_EMPLOYEE;

      const createEmployeeDto = {
        name: 'test',
        post: 'tester',
        admission: new Date('2020-01-01'),
      };

      const repositoryCreateSpy = jest.spyOn(
        employeesMongoRepository,
        'create',
      );
      const repositoryFindOneByNameSpy = jest
        .spyOn(employeesMongoRepository, 'findOneByName')
        .mockResolvedValueOnce(undefined);

      const result = await employeeService.create(createEmployeeDto);

      expect(result).toEqual(expected);
      expect(repositoryFindOneByNameSpy).toHaveBeenCalledWith(
        createEmployeeDto.name,
      );
      expect(repositoryCreateSpy).toHaveBeenCalledWith(createEmployeeDto);
    });

    it('should throw when an employee already exists', async () => {
      const createEmployeeDto = {
        name: 'test',
        post: 'tester',
        admission: new Date('2020-01-01'),
      };

      const result = employeeService.create(createEmployeeDto);

      await expect(result).rejects.toThrowError('Employee already exists');
    });
  });

  describe('Update', () => {
    it('should update an employee when valid data is inserted', async () => {
      const updateEmployeeDto = {
        name: 'new test',
        post: 'new tester',
        admission: new Date('2020-01-20'),
        active: false,
        projects: ['any_id', 'any_id'],
      };

      const expected = {
        name: 'new test',
        post: 'new tester',
        admission: new Date('2020-01-20'),
        active: false,
        projects: ['any_id', 'any_id'],
      };

      const id = 'any';

      const repositoryFindOneByNameSpy = jest
        .spyOn(employeesMongoRepository, 'findOneByName')
        .mockReturnValueOnce(undefined);

      const repositoryUpdateSpy = jest.spyOn(
        employeesMongoRepository,
        'update',
      );

      const result = await employeeService.update(id, updateEmployeeDto);

      expect(result).toMatchObject(expected);
      expect(repositoryUpdateSpy).toHaveBeenCalledWith(id, updateEmployeeDto);
      expect(repositoryFindOneByNameSpy).toHaveBeenCalledWith(
        updateEmployeeDto.name,
      );
    });

    it("should update an employee's name when id is equal to its id", async () => {
      const updateEmployeeDto = {
        name: 'Test',
      };

      const expected = Object.assign(
        {},
        CONSTANTS.VALID_EMPLOYEE,
        updateEmployeeDto,
      );

      const id = 'any';

      const repositoryFindOneByNameSpy = jest.spyOn(
        employeesMongoRepository,
        'findOneByName',
      );

      const repositoryUpdateSpy = jest
        .spyOn(employeesMongoRepository, 'update')
        .mockResolvedValueOnce(expected);

      const result = await employeeService.update(id, updateEmployeeDto);

      expect(result).toMatchObject(expected);
      expect(repositoryUpdateSpy).toHaveBeenCalledWith(id, updateEmployeeDto);
      expect(repositoryFindOneByNameSpy).toHaveBeenCalledWith(
        updateEmployeeDto.name,
      );
    });

    it('should throw when name already exists with another id', async () => {
      const updateEmployeeDto = {
        name: 'test',
      };

      const id = 'different_id';

      const repositoryFindOneByNameSpy = jest.spyOn(
        employeesMongoRepository,
        'findOneByName',
      );

      const result = employeeService.update(id, updateEmployeeDto);

      await expect(result).rejects.toThrowError('Name already exists');
      expect(repositoryFindOneByNameSpy).toHaveBeenCalledWith(
        updateEmployeeDto.name,
      );
    });

    it('should throw when an employee is not found', async () => {
      const updateEmployeeDto = {
        name: 'new test',
        post: 'new tester',
        admission: new Date('2020-01-20'),
        active: false,
        projects: ['any_id', 'any_id'],
      };

      const id = 'invalid';

      jest
        .spyOn(employeesMongoRepository, 'findOneByName')
        .mockReturnValueOnce(undefined);

      jest
        .spyOn(employeesMongoRepository, 'update')
        .mockResolvedValueOnce(null);

      const result = employeeService.update(id, updateEmployeeDto);

      await expect(result).rejects.toThrow('Employee not found');
      await expect(result).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw when a project does not exist', async () => {
      const updateEmployeeDto = {
        name: 'new test',
        post: 'new tester',
        admission: new Date('2020-01-20'),
        active: false,
        projects: ['any_id', 'invalid_id'],
      };

      const id = 'any_id';

      jest
        .spyOn(employeesMongoRepository, 'findOneByName')
        .mockReturnValueOnce(undefined);

      jest
        .spyOn(projectsMongoRepository, 'findById')
        .mockImplementation(async (id) => {
          if (id === 'invalid_id') return null;
          return CONSTANTS.VALID_PROJECT;
        });

      const result = employeeService.update(id, updateEmployeeDto);

      await expect(result).rejects.toThrow('Project invalid_id not found');
      await expect(result).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('findAll', () => {
    it('should call repository findAll when it is called', async () => {
      const expected = [CONSTANTS.VALID_EMPLOYEE];

      const repositoryFindAllSpy = jest.spyOn(
        employeesMongoRepository,
        'findAll',
      );

      const result = await employeeService.findAll();

      expect(result).toStrictEqual(expected);
      expect(repositoryFindAllSpy).toHaveBeenCalled();
    });

    it('should throw when findAll throws', async () => {
      const repositoryFindAllSpy = jest
        .spyOn(employeesMongoRepository, 'findAll')
        .mockRejectedValueOnce(new Error());

      const result = employeeService.findAll();

      await expect(result).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should call repository findById when it is called', async () => {
      const expected = CONSTANTS.VALID_EMPLOYEE;

      const repositoryFindByIdSpy = jest.spyOn(
        employeesMongoRepository,
        'findById',
      );

      const id = 'any';

      const result = await employeeService.findOne(id);

      expect(result).toStrictEqual(expected);
      expect(repositoryFindByIdSpy).toHaveBeenCalledWith(id);
    });

    it('should throw when the employee is not found', async () => {
      const repositoryFindByIdSpy = jest
        .spyOn(employeesMongoRepository, 'findById')
        .mockResolvedValueOnce(undefined);

      const id = 'any';

      const result = employeeService.findOne(id);

      expect(repositoryFindByIdSpy).toHaveBeenCalledWith(id);
      await expect(result).rejects.toThrowError('Employee not found');
    });

    it('should throw when findById throws', async () => {
      const repositoryFindByIdSpy = jest
        .spyOn(employeesMongoRepository, 'findById')
        .mockRejectedValueOnce(new Error());

      const id = 'any';

      const result = employeeService.findOne(id);

      expect(repositoryFindByIdSpy).toHaveBeenCalledWith(id);
      await expect(result).rejects.toThrow();
    });
  });
});
