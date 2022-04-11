import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
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

      const result = await employeeService.create(createEmployeeDto);

      expect(result).toEqual(expected);
      expect(repositoryCreateSpy).toHaveBeenCalledWith(createEmployeeDto);
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
});
