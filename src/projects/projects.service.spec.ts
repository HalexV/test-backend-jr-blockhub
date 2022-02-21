import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project, ProjectDocument } from './entities/project.schema';
import { ProjectsService } from './projects.service';

class ProjectModelStub {
  async save() {
    return {
      name: 'test project',
      description: 'test description',
      startDate: new Date('2022-01-01'),
      active: true,
    };
  }
}

describe('ProjectsService', () => {
  let projectService: ProjectsService;
  let projectModel: Model<ProjectDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getModelToken(Project.name),
          useValue: ProjectModelStub,
        },
      ],
    }).compile();

    projectService = module.get<ProjectsService>(ProjectsService);
    projectModel = module.get<Model<ProjectDocument>>(
      getModelToken(Project.name),
    );
  });

  it('should be defined', () => {
    expect(projectService).toBeDefined();
    expect(projectModel).toBeDefined();
  });

  describe('create', () => {
    it('should be able to create a project', async () => {
      const saveSpy = jest.spyOn(projectModel.prototype, 'save');

      const createProjectDto: CreateProjectDto = {
        name: 'test project',
        description: 'test description',
        startDate: new Date('2022-01-01'),
      };

      const expected = {
        name: 'test project',
        description: 'test description',
        startDate: new Date('2022-01-01'),
        active: true,
      };

      const result = await projectService.create(createProjectDto);

      expect(result).toStrictEqual(expected);
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });
  });
});
