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
    private readonly projectsRepository: IEmployeesRepository,
  ) {}

  // async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
  //   const employee = new this.employeeModel(createEmployeeDto);
  //   return await employee.save();
  // }

  // async update(
  //   id: string,
  //   updateEmployeeDto: UpdateEmployeeDto,
  // ): Promise<Employee> {
  //   return await this.employeeModel.findByIdAndUpdate(id, updateEmployeeDto, {
  //     returnDocument: 'after',
  //   });
  // }

  // async findOne(id: string): Promise<Employee> {
  //   return await this.employeeModel.findById(id);
  // }

  // async findAll(): Promise<Employee[]> {
  //   return await this.employeeModel.find();
  // }
}
