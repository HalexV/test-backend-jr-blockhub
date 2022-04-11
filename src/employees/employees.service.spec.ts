import { Test, TestingModule } from '@nestjs/testing';
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
    name: 'test',
    post: 'tester',
    admission: new Date('2020-01-01'),
    active: true,
    projects: [],
  },
};

class EmployeesMongoRepositoryStub {
  async create() {
    return CONSTANTS.VALID_EMPLOYEE;
  }

  async findOneByName() {
    return CONSTANTS.VALID_EMPLOYEE;
  }

  async findAll() {
    return [CONSTANTS.VALID_EMPLOYEE];
  }
}

describe('EmployeesService', () => {
  let employeeService: EmployeesService;
  let employeesMongoRepository: EmployeesMongoRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: EmployeesMongoRepository,
          useValue: new EmployeesMongoRepositoryStub(),
        },
      ],
    }).compile();

    employeeService = module.get<EmployeesService>(EmployeesService);
    employeesMongoRepository = module.get<EmployeesMongoRepository>(
      EmployeesMongoRepository,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(employeeService).toBeDefined();
    expect(employeesMongoRepository).toBeDefined();
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
    // it('should be able to update an employee', async () => {
    //   const findByIdAndUpdateSpy = jest.spyOn(
    //     employeeModel,
    //     'findByIdAndUpdate',
    //   );
    //   const updateEmployeeDto = {
    //     name: 'test1',
    //     post: 'tester1',
    //     admission: new Date('2020-01-02'),
    //     active: false,
    //   };
    //   const employeeUpdated = {
    //     name: 'test1',
    //     post: 'tester1',
    //     admission: new Date('2020-01-02'),
    //     active: false,
    //   };
    //   const result = await employeeService.update('any', updateEmployeeDto);
    //   expect(result).toEqual(employeeUpdated);
    //   expect(findByIdAndUpdateSpy).toHaveBeenCalledWith(
    //     'any',
    //     updateEmployeeDto,
    //     {
    //       returnDocument: 'after',
    //     },
    //   );
    // });
  });

  describe('findAll', () => {
    test('should call repository findAll when findAll is called', async () => {
      const expected = [CONSTANTS.VALID_EMPLOYEE];

      const repositoryFindAllSpy = jest.spyOn(
        employeesMongoRepository,
        'findAll',
      );

      const result = await employeeService.findAll();

      expect(result).toStrictEqual(expected);
      expect(repositoryFindAllSpy).toHaveBeenCalled();
    });
  });
});
