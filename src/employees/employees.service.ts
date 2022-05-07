import { Inject, Injectable } from '@nestjs/common';
import { IProjectsRepository } from '../projects/repositories/interface.projects.repository';
import { ProjectsMongoRepository } from '../projects/repositories/projects.mongo.repository';
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
    @Inject(ProjectsMongoRepository)
    private readonly projectsMongoRepository: IProjectsRepository,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const { name } = createEmployeeDto;

    const employeeAlreadyExists = await this.employeesRepository.findOneByName(
      name,
    );

    if (employeeAlreadyExists)
      throw new ValidationError('Employee already exists');

    return await this.employeesRepository.create(createEmployeeDto);
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const { name, projects } = updateEmployeeDto;

    if (name) {
      const employeeAlreadyExists =
        await this.employeesRepository.findOneByName(name);

      if (employeeAlreadyExists && employeeAlreadyExists.id !== id)
        throw new ValidationError('Name already exists');
    }

    if (Array.isArray(projects)) {
      let project;
      for (let index = 0; index < projects.length; index += 1) {
        project = await this.projectsMongoRepository.findById(projects[index]);

        if (!project)
          throw new NotFoundError(`Project ${projects[index]} not found`);
      }
    }

    const employeeUpdated = await this.employeesRepository.update(
      id,
      updateEmployeeDto,
    );

    if (!employeeUpdated) throw new NotFoundError('Employee not found');

    return employeeUpdated;
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
