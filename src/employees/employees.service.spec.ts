import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { EmployeesService } from './employees.service';
import { Employee, EmployeeDocument } from './entities/employee.schema';
import { EmployeesMongoRepository } from './repositories/employees.mongo.repository';

let employeeModelConstructorArgs;
class EmployeeModelStub {
  constructor(private data) {
    employeeModelConstructorArgs = data;
  }
  async save() {
    return {
      name: 'test',
      post: 'tester',
      admission: new Date('2020-01-01'),
      active: true,
    };
  }

  static async findByIdAndUpdate() {
    return {
      name: 'test1',
      post: 'tester1',
      admission: new Date('2020-01-02'),
      active: false,
    };
  }
}

class EmployeesMongoRepositoryStub {}

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

    employeeModelConstructorArgs = null;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(employeeService).toBeDefined();
    expect(employeesMongoRepository).toBeDefined();
  });

  // describe('create', () => {
  //   it('should be able to create an employee', async () => {
  //     jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01'));
  //     const saveSpy = jest.spyOn(employeeModel.prototype, 'save');

  //     const expected = {
  //       name: 'test',
  //       post: 'tester',
  //       admission: new Date('2020-01-01'),
  //       active: true,
  //     };

  //     const createEmployeeDto = {
  //       name: 'test',
  //       post: 'tester',
  //     };

  //     const result = await employeeService.create(createEmployeeDto);

  //     expect(result).toEqual(expected);
  //     expect(employeeModelConstructorArgs).toEqual(createEmployeeDto);
  //     expect(saveSpy).toHaveBeenCalledTimes(1);
  //   });

  //   it('should throw when save throws', async () => {
  //     jest
  //       .spyOn(employeeModel.prototype, 'save')
  //       .mockRejectedValueOnce(new Error());

  //     const createEmployeeDto = {
  //       name: 'test',
  //       post: 'tester',
  //     };

  //     const result = employeeService.create(createEmployeeDto);

  //     await expect(result).rejects.toThrowError();
  //   });
  // });

  // describe('Update', () => {
  //   it('should be able to update an employee', async () => {
  //     const findByIdAndUpdateSpy = jest.spyOn(
  //       employeeModel,
  //       'findByIdAndUpdate',
  //     );

  //     const updateEmployeeDto = {
  //       name: 'test1',
  //       post: 'tester1',
  //       admission: new Date('2020-01-02'),
  //       active: false,
  //     };

  //     const employeeUpdated = {
  //       name: 'test1',
  //       post: 'tester1',
  //       admission: new Date('2020-01-02'),
  //       active: false,
  //     };

  //     const result = await employeeService.update('any', updateEmployeeDto);

  //     expect(result).toEqual(employeeUpdated);
  //     expect(findByIdAndUpdateSpy).toHaveBeenCalledWith(
  //       'any',
  //       updateEmployeeDto,
  //       {
  //         returnDocument: 'after',
  //       },
  //     );
  //   });
  // });
});
