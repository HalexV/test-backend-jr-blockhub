import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { Project, ProjectDocument } from '../entities/project.schema';
import { IProjectsRepository } from './interface.projects.repository';

@Injectable()
export class ProjectsMongoRepository implements IProjectsRepository {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(project: CreateProjectDto): Promise<Project> {
    const newProject = await new this.projectModel(project);
    return await newProject.save();
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    return await this.projectModel.findByIdAndUpdate(id, updateProjectDto, {
      returnDocument: 'after',
    });
  }

  async findOneByName(name: string): Promise<Project> {
    const project = await this.projectModel.findOne({ name });

    if (!project) return null;

    return project.toObject();
  }

  async findById(id: string): Promise<Project> {
    try {
      const project = await this.projectModel.findById(id);

      if (!project) return null;

      return project.toObject();
    } catch (error) {
      return null;
    }
  }

  async findAll(): Promise<Project[]> {
    return await this.projectModel.find({});
  }
}
