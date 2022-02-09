import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { EmployeesService } from './employees.service';
import { Employee, EmployeeDocument } from './entities/employee.schema';

let employeeModelConstructorArgs;
let saveCalls = 0;
class EmployeeModelStub {
  constructor(private data) {
    employeeModelConstructorArgs = data;
  }
  save() {
    saveCalls++;
    return {
      name: 'test',
      post: 'tester',
      admission: new Date('2020-01-01'),
      active: true,
    };
  }
}

describe('EmployeesService', () => {
  let employeeService: EmployeesService;
  let employeeModel: Model<EmployeeDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: getModelToken(Employee.name),
          useValue: EmployeeModelStub,
        },
      ],
    }).compile();

    employeeService = module.get<EmployeesService>(EmployeesService);
    employeeModel = module.get<Model<EmployeeDocument>>(
      getModelToken(Employee.name),
    );

    employeeModelConstructorArgs = null;
    saveCalls = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(employeeService).toBeDefined();
    expect(employeeModel).toBeDefined();
  });

  describe('create', () => {
    it('should be able to create an employee', async () => {
      jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01'));

      const expected = {
        name: 'test',
        post: 'tester',
        admission: new Date('2020-01-01'),
        active: true,
      };

      const createEmployeeDto = {
        name: 'test',
        post: 'tester',
      };

      const result = await employeeService.create(createEmployeeDto);

      expect(result).toEqual(expected);
      expect(employeeModelConstructorArgs).toEqual(createEmployeeDto);
      expect(saveCalls).toBe(1);
    });
  });
});
