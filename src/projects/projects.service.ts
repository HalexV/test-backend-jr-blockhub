import { Inject, Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.schema';
import { IProjectsRepository } from './repositories/interface.projects.repository';
import { ProjectsMongoRepository } from './repositories/projects.mongo.repository';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(ProjectsMongoRepository)
    private readonly projectsRepository: IProjectsRepository,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const { startDate, endDate, name } = createProjectDto;

    const startDateMs = new Date(startDate).getTime();
    const endDateMs = new Date(endDate).getTime();

    if (endDate && startDateMs >= endDateMs) {
      const error = new Error('startDate must be lesser than endDate');
      error.name = 'ValidationError';

      throw error;
    }

    const projectAlreadyExist = await this.projectsRepository.findOneByName(
      name,
    );

    if (projectAlreadyExist) {
      const error = new Error("The project's name already exists");
      error.name = 'ValidationError';

      throw error;
    }

    return await this.projectsRepository.create(createProjectDto);
  }

  findAll() {
    return `This action returns all projects`;
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const { name } = updateProjectDto;

    const project = await this.projectsRepository.findById(id);

    if (!project) {
      const error = new Error('Project not found');
      error.name = 'ValidationError';

      throw error;
    }

    if (name) {
      const projectAlreadyExist = await this.projectsRepository.findOneByName(
        name,
      );

      if (projectAlreadyExist) {
        const error = new Error("The project's name already exists");
        error.name = 'ValidationError';

        throw error;
      }
    }

    return await this.projectsRepository.update(id, updateProjectDto);
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
