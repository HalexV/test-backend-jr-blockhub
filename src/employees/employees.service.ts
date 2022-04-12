import { Inject, Injectable } from '@nestjs/common';
import { ValidationError, NotFoundError } from '../errors';
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
    const { name } = createEmployeeDto;

    const employeeAlreadyExists = await this.employeesRepository.findOneByName(
      name,
    );

    if (employeeAlreadyExists)
      throw new ValidationError('Employee already exists');

    return this.employeesRepository.create(createEmployeeDto);
  }

  async findAll(): Promise<Employee[]> {
    return this.employeesRepository.findAll();
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findById(id);

    if (!employee) throw new NotFoundError('Employee not found');

    return employee;
  }
}
