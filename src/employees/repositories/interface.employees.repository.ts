import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { Employee } from '../entities/employee.schema';

export interface IEmployeesRepository {
  create(employee: CreateEmployeeDto): Promise<Employee>;
  update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee>;
  findOneByName(name: string): Promise<Employee>;
  findById(id: string): Promise<Employee>;
  findAll(): Promise<Employee[]>;
}
