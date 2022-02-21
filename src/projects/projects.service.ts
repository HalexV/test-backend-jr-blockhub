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

    const startDateMs = new Date(startDate).getTime();
    const endDateMs = new Date(endDate).getTime();

    if (endDate && startDateMs <= endDateMs) {
      const error = new Error('startDate must be greater than endDate');
      error.name = 'ValidationError';

      throw error;
    }

    const projectAlreadyExist = await this.projectModel.findOne({ name });

    if (!projectAlreadyExist) {
      const error = new Error("The project's name already exists");
      error.name = 'ValidationError';

      throw error;
    }

    const project = new this.projectModel(createProjectDto);
    return await project.save();
  }

  findAll() {
    return `This action returns all projects`;
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
