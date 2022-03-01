import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { Project } from '../entities/project.schema';

export interface IProjectsRepository {
  create(project: CreateProjectDto): Promise<Project>;
  update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project>;
  findOneByName(name: string): Promise<Project>;
  findById(id: string): Promise<Project>;
  findAll(): Promise<Project[]>;
}
