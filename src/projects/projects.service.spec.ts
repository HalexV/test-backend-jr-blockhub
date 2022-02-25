import { Test, TestingModule } from '@nestjs/testing';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';
import { ProjectsMongoRepository } from './repositories/projects.mongo.repository';

class ProjectsMongoRepositoryStub {
  async create() {
    return {
      name: 'test project',
      description: 'test description',
      startDate: new Date('2022-01-01'),
      active: true,
    };
  }

  async update() {
    return {
      name: 'test project test',
      description: 'test description',
      startDate: new Date('2022-01-01'),
      active: true,
    };
  }

  async findOneByName() {
    return {
      name: 'test project',
      description: 'test description',
      startDate: new Date('2022-01-01'),
      active: true,
    };
  }

  async findById() {
    return {
      name: 'test project',
      description: 'test description',
      startDate: new Date('2022-01-01'),
      endDate: new Date('2022-01-02'),
      active: true,
    };
  }
}

describe('ProjectsService', () => {
  let projectService: ProjectsService;
  let projectsMongoRepository: ProjectsMongoRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: ProjectsMongoRepository,
          useValue: new ProjectsMongoRepositoryStub(),
        },
      ],
    }).compile();

    projectService = module.get<ProjectsService>(ProjectsService);
    projectsMongoRepository = module.get<ProjectsMongoRepository>(
      ProjectsMongoRepository,
    );
  });

  it('should be defined', () => {
    expect(projectService).toBeDefined();
    expect(projectsMongoRepository).toBeDefined();
  });

  describe('create', () => {
    it('should be able to create a project', async () => {
      jest
        .spyOn(projectsMongoRepository, 'findOneByName')
        .mockResolvedValueOnce(null);

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
    });

    it('should throw when name is invalid', async () => {
      jest
        .spyOn(projectsMongoRepository, 'create')
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
        .spyOn(projectsMongoRepository, 'create')
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
        .spyOn(projectsMongoRepository, 'create')
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
        .spyOn(projectsMongoRepository, 'create')
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

  describe('update', () => {
    it("should throw when the project's name already exists", async () => {
      const updateProjectDto: UpdateProjectDto = {
        name: 'test project',
      };
      const result = projectService.update('any_id', updateProjectDto);
      await expect(result).rejects.toThrowError(
        "The project's name already exists",
      );
    });

    it("should update the project's name when the name is valid", async () => {
      const expected = {
        name: 'test project test',
      };

      jest
        .spyOn(projectsMongoRepository, 'findOneByName')
        .mockResolvedValueOnce(null);

      const updateProjectDto: UpdateProjectDto = {
        name: 'test project test',
      };
      const result = await projectService.update('valid_id', updateProjectDto);
      expect(result.name).toStrictEqual(expected.name);
    });

    it('should throw when the project does not exist', async () => {
      jest
        .spyOn(projectsMongoRepository, 'findById')
        .mockResolvedValueOnce(null);
      const updateProjectDto: UpdateProjectDto = {
        name: 'test project',
      };
      const result = projectService.update('invalid_id', updateProjectDto);
      await expect(result).rejects.toThrowError('Project not found');
    });

    it('should throw when input startDate is greater than input endDate', async () => {
      const updateProjectDto: UpdateProjectDto = {
        startDate: new Date(new Date('2022-01-02').getTime() + 1),
        endDate: new Date('2022-01-02'),
      };

      const result = projectService.update('valid_id', updateProjectDto);

      await expect(result).rejects.toThrowError(
        'startDate must be lesser than endDate',
      );
    });

    it('should throw when input startDate is invalid', async () => {
      const updateProjectDto: UpdateProjectDto = {
        startDate: new Date('invalid'),
      };

      const result = projectService.update('valid_id', updateProjectDto);

      await expect(result).rejects.toThrowError('startDate must be a date');
    });
  });
});
