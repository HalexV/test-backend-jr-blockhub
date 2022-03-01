import { Test, TestingModule } from '@nestjs/testing';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';
import { ProjectsMongoRepository } from './repositories/projects.mongo.repository';

const START_DATE = new Date('2022-01-01');
const UPDATED_START_DATE = new Date('2021-01-01');

const END_DATE = new Date('2022-01-02');
const UPDATED_END_DATE = new Date('2022-01-04');

const VALID_PROJECT = {
  name: 'test project',
  description: 'test description',
  startDate: START_DATE,
  endDate: END_DATE,
  active: true,
};

const VALID_UPDATED_PROJECT = {
  name: 'test project test',
  description: 'test description test',
  startDate: UPDATED_START_DATE,
  endDate: UPDATED_END_DATE,
  active: false,
};

class ProjectsMongoRepositoryStub {
  async create() {
    return {
      name: 'test project',
      description: 'test description',
      startDate: START_DATE,
      active: true,
    };
  }

  async update() {
    return VALID_UPDATED_PROJECT;
  }

  async findOneByName() {
    return VALID_PROJECT;
  }

  async findById() {
    return VALID_PROJECT;
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
        startDate: START_DATE,
      };

      const expected = {
        name: 'test project',
        description: 'test description',
        startDate: START_DATE,
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
        startDate: START_DATE,
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
        startDate: START_DATE,
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
        startDate: START_DATE,
        endDate: new Date('invalid'),
      };

      const result = projectService.create(createProjectDto);

      await expect(result).rejects.toThrowError();
    });

    it('should throw when startDate is greater than endDate', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'test project',
        description: 'test description',
        startDate: START_DATE,
        endDate: new Date(START_DATE.getTime() - 1),
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
        startDate: START_DATE,
        endDate: START_DATE,
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
        startDate: START_DATE,
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

    it("should update the project's startDate when the startDate is valid", async () => {
      const expected = VALID_UPDATED_PROJECT;

      jest
        .spyOn(projectsMongoRepository, 'findOneByName')
        .mockResolvedValueOnce(null);

      const updateProjectDto: UpdateProjectDto = {
        startDate: UPDATED_START_DATE,
      };
      const result = await projectService.update('valid_id', updateProjectDto);
      expect(result.startDate).toStrictEqual(expected.startDate);
    });

    it("should update the project's endDate when the endDate is valid", async () => {
      const expected = VALID_UPDATED_PROJECT;

      jest
        .spyOn(projectsMongoRepository, 'findOneByName')
        .mockResolvedValueOnce(null);

      const updateProjectDto: UpdateProjectDto = {
        endDate: UPDATED_END_DATE,
      };
      const result = await projectService.update('valid_id', updateProjectDto);
      expect(result.endDate).toStrictEqual(expected.endDate);
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
        startDate: new Date(END_DATE.getTime() + 1),
        endDate: END_DATE,
      };

      const result = projectService.update('valid_id', updateProjectDto);

      await expect(result).rejects.toThrowError(
        'startDate must be lesser than endDate',
      );
    });

    it('should throw when input startDate is greater than database endDate', async () => {
      const updateProjectDto: UpdateProjectDto = {
        startDate: new Date(END_DATE.getTime() + 1),
      };

      const result = projectService.update('valid_id', updateProjectDto);

      await expect(result).rejects.toThrowError(
        'startDate must be lesser than endDate',
      );
    });

    it('should throw when input startDate is equal to database endDate', async () => {
      const updateProjectDto: UpdateProjectDto = {
        startDate: END_DATE,
      };

      const result = projectService.update('valid_id', updateProjectDto);

      await expect(result).rejects.toThrowError(
        'startDate must be lesser than endDate',
      );
    });

    it('should throw when input startDate is equal to input endDate', async () => {
      const updateProjectDto: UpdateProjectDto = {
        startDate: END_DATE,
        endDate: END_DATE,
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

    it('should throw when input endDate is invalid', async () => {
      const updateProjectDto1: UpdateProjectDto = {
        startDate: START_DATE,
        endDate: new Date('invalid'),
      };

      const result1 = projectService.update('valid_id', updateProjectDto1);
      await expect(result1).rejects.toThrowError('endDate must be a date');

      const updateProjectDto2: UpdateProjectDto = {
        endDate: new Date('invalid'),
      };

      const result2 = projectService.update('valid_id', updateProjectDto2);
      await expect(result2).rejects.toThrowError('endDate must be a date');
    });

    it('should throw when input endDate is lesser than database startDate', async () => {
      const updateProjectDto: UpdateProjectDto = {
        endDate: new Date(START_DATE.getTime() - 1),
      };

      const result = projectService.update('valid_id', updateProjectDto);

      await expect(result).rejects.toThrowError(
        'endDate must be greater than startDate',
      );
    });

    it('should throw when input endDate is equal to database startDate', async () => {
      const updateProjectDto: UpdateProjectDto = {
        endDate: START_DATE,
      };

      const result = projectService.update('valid_id', updateProjectDto);

      await expect(result).rejects.toThrowError(
        'endDate must be greater than startDate',
      );
    });
  });

  describe('findOne', () => {
    it('should list a project', async () => {
      const expected = VALID_PROJECT;

      const result = await projectService.findOne('any_id');

      expect(result).toMatchObject(expected);
    });
  });
});
