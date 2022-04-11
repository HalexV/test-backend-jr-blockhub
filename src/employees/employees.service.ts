import { Inject, Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.schema';
import { EmployeesMongoRepository } from './repositories/employees.mongo.repository';
import { IEmployeesRepository } from './repositories/interface.employees.repository';

@Injectable()
export class EmployeesService {
  constructor(
    @Inject(EmployeesMongoRepository)
    private readonly employeesRepository: IEmployeesRepository,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const employee = this.employeesRepository.create(createEmployeeDto);
    return employee;
  }
}
