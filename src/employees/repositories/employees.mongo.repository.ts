import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { Employee, EmployeeDocument } from '../entities/employee.schema';
import { IEmployeesRepository } from './interface.employees.repository';
import MongoHelper from '../../database/utils/mongo/MongoHelper';

@Injectable()
export class EmployeesMongoRepository implements IEmployeesRepository {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {}

  async create(employee: CreateEmployeeDto): Promise<Employee> {
    const newEmployee = await new this.employeeModel(employee);
    const docEmployee = await newEmployee.save();
    return MongoHelper.map(docEmployee.toObject());
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const docEmployee = await this.employeeModel.findByIdAndUpdate(
      id,
      updateEmployeeDto,
      {
        returnDocument: 'after',
      },
    );

    if (!docEmployee) return null;

    return MongoHelper.map(docEmployee.toObject());
  }

  async findOneByName(name: string): Promise<Employee> | undefined {
    const docEmployee = await this.employeeModel.findOne({
      name: { $regex: `^${name}$`, $options: 'i' },
    });

    if (!docEmployee) return null;

    return MongoHelper.map(docEmployee.toObject());
  }

  async findAll(): Promise<Employee[]> {
    const docsEmployees = await this.employeeModel.find({});
    return docsEmployees.map((docEmployee) =>
      MongoHelper.map(docEmployee.toObject()),
    );
  }

  async findById(id: string): Promise<Employee> | undefined {
    try {
      const docEmployee = await this.employeeModel.findById(id);

      if (!docEmployee) return null;

      return MongoHelper.map(docEmployee.toObject());
    } catch (error) {
      return null;
    }
  }
}
