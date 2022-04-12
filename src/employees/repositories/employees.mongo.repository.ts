import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { Employee, EmployeeDocument } from '../entities/employee.schema';
import { IEmployeesRepository } from './interface.employees.repository';

@Injectable()
export class EmployeesMongoRepository implements IEmployeesRepository {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {}
  update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    throw new Error('Method not implemented.');
  }

  async create(employee: CreateEmployeeDto): Promise<Employee> {
    const newEmployee = await new this.employeeModel(employee);
    return await newEmployee.save();
  }

  async findOneByName(name: string): Promise<Employee> | undefined {
    return await this.employeeModel.findOne({
      name: { $regex: `^${name}$`, $options: 'i' },
    });
  }

  async findAll(): Promise<Employee[]> {
    return await this.employeeModel.find({});
  }

  async findById(id: string): Promise<Employee> | undefined {
    try {
      const employee = await this.employeeModel.findById(id);

      if (!employee) return null;

      return employee.toObject();
    } catch (error) {
      return null;
    }
  }

  // async update(
  //   id: string,
  //   updateProjectDto: UpdateProjectDto,
  // ): Promise<Project> {
  //   return await this.projectModel.findByIdAndUpdate(id, updateProjectDto, {
  //     returnDocument: 'after',
  //   });
  // }

  // async findOneByName(name: string): Promise<Project> {
  //   const project = await this.projectModel.findOne({ name });

  //   if (!project) return null;

  //   return project.toObject();
  // }
}
