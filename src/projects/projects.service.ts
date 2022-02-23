import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, ProjectDocument } from './entities/project.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const { startDate, endDate, name } = createProjectDto;

    const project = new this.projectModel(createProjectDto);
    await project.validate();

    const startDateMs = new Date(startDate).getTime();
    const endDateMs = new Date(endDate).getTime();

    if (endDate && startDateMs >= endDateMs) {
      const error = new Error('startDate must be lesser than endDate');
      error.name = 'ValidationError';

      throw error;
    }

    const projectAlreadyExist = await this.projectModel.findOne({ name });

    if (projectAlreadyExist) {
      const error = new Error("The project's name already exists");
      error.name = 'ValidationError';

      throw error;
    }

    return await project.save();
  }

  findAll() {
    return `This action returns all projects`;
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const { name } = updateProjectDto;

    const project = await this.projectModel.findById(id);

    if (!project) {
      const error = new Error('Project not found');
      error.name = 'ValidationError';

      throw error;
    }

    if (name) {
      const projectAlreadyExist = await this.projectModel.findOne({
        _id: { $ne: id },
        name,
      });

      if (projectAlreadyExist) {
        const error = new Error("The project's name already exists");
        error.name = 'ValidationError';

        throw error;
      }
    }

    return null;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
