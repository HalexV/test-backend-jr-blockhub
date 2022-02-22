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

  async validate() {
    return;
  }

  static async findOne() {
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
      jest.spyOn(projectModel, 'findOne').mockResolvedValueOnce(null);
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

    it('should throw when name is invalid', async () => {
      jest
        .spyOn(projectModel.prototype, 'validate')
        .mockRejectedValueOnce(new Error());
      const createProjectDto: CreateProjectDto = {
        name: 'invalid',
        description: 'test description',
        startDate: new Date('2022-01-01'),
      };

      const result = projectService.create(createProjectDto);

      await expect(result).rejects.toThrowError();
    });

    it('should throw when description is invalid', async () => {
      jest
        .spyOn(projectModel.prototype, 'validate')
        .mockRejectedValueOnce(new Error());
      const createProjectDto: CreateProjectDto = {
        name: 'test project',
        description: 'invalid',
        startDate: new Date('2022-01-01'),
      };

      const result = projectService.create(createProjectDto);

      await expect(result).rejects.toThrowError();
    });

    it('should throw when startDate is invalid', async () => {
      jest
        .spyOn(projectModel.prototype, 'validate')
        .mockRejectedValueOnce(new Error());
      const createProjectDto: CreateProjectDto = {
        name: 'test project',
        description: 'test description',
        startDate: new Date('invalid'),
      };

      const result = projectService.create(createProjectDto);

      await expect(result).rejects.toThrowError();
    });

    it('should throw when endDate is invalid', async () => {
      jest
        .spyOn(projectModel.prototype, 'validate')
        .mockRejectedValueOnce(new Error());
      const createProjectDto: CreateProjectDto = {
        name: 'test project',
        description: 'test description',
        startDate: new Date('2022-01-01'),
        endDate: new Date('invalid'),
      };

      const result = projectService.create(createProjectDto);

      await expect(result).rejects.toThrowError();
    });

    it('should throw when startDate is greater than endDate', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'test project',
        description: 'test description',
        startDate: new Date('2022-01-01'),
        endDate: new Date(new Date('2022-01-01').getTime() - 1),
      };

      const result = projectService.create(createProjectDto);

      await expect(result).rejects.toThrowError(
        'startDate must be lesser than endDate',
      );
    });

    it('should throw when startDate is equal to endDate', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'test project',
        description: 'test description',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-01-01'),
      };

      const result = projectService.create(createProjectDto);

      await expect(result).rejects.toThrowError(
        'startDate must be lesser than endDate',
      );
    });

    it("should throw when the project's name already exists", async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'test project',
        description: 'test description',
        startDate: new Date('2022-01-01'),
      };

      const result = projectService.create(createProjectDto);

      await expect(result).rejects.toThrowError(
        "The project's name already exists",
      );
    });
  });
});
