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

  async findAll() {
    return await this.projectsRepository.findAll();
  }

  async findOne(id: string) {
    const project = await this.projectsRepository.findById(id);

    if (!project) {
      const error = new Error('Project not found');
      error.name = 'NotFoundError';

      throw error;
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const { name, startDate, endDate } = updateProjectDto;

    const project = await this.projectsRepository.findById(id);

    if (!project) {
      const error = new Error('Project not found');
      error.name = 'NotFoundError';

      throw error;
    }

    if (startDate) {
      const objStartDate = new Date(startDate);

      if (objStartDate.toString() === 'Invalid Date') {
        const error = new Error('startDate must be a date');
        error.name = 'ValidationError';

        throw error;
      }

      if (endDate) {
        const objEndDate = new Date(endDate);

        if (objEndDate.toString() === 'Invalid Date') {
          const error = new Error('endDate must be a date');
          error.name = 'ValidationError';

          throw error;
        }

        if (objStartDate.getTime() >= objEndDate.getTime()) {
          const error = new Error('startDate must be lesser than endDate');
          error.name = 'ValidationError';

          throw error;
        }
      } else {
        if (objStartDate.getTime() >= project.endDate.getTime()) {
          const error = new Error('startDate must be lesser than endDate');
          error.name = 'ValidationError';

          throw error;
        }
      }
    }

    if (endDate) {
      const objEndDate = new Date(endDate);

      if (objEndDate.toString() === 'Invalid Date') {
        const error = new Error('endDate must be a date');
        error.name = 'ValidationError';

        throw error;
      }

      if (objEndDate.getTime() <= project.startDate.getTime()) {
        const error = new Error('endDate must be greater than startDate');
        error.name = 'ValidationError';

        throw error;
      }
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
