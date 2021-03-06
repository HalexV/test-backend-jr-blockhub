import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection, Types } from 'mongoose';
import { DatabaseService } from './../src/database/database.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dbConnection: Connection;
  let httpServer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dbConnection = moduleFixture
      .get<DatabaseService>(DatabaseService)
      .getDbHandle();
    httpServer = app.getHttpServer();
  });

  beforeEach(async () => {
    await dbConnection.collection('projects').deleteMany({});
    await dbConnection.collection('employees').deleteMany({});
  });

  afterAll(async () => {
    await dbConnection.collection('projects').deleteMany({});
    await dbConnection.collection('employees').deleteMany({});
    await app.close();
  });

  describe('Projects Resource', () => {
    describe('/projects (POST)', () => {
      it('should return 201 when creating with valid data', async () => {
        const inputPayload = {
          name: 'test',
          description: 'description test',
          startDate: '2022-02-22',
        };

        const partialExpected = {
          name: 'test',
          description: 'description test',
          startDate: new Date('2022-02-22').toISOString(),
        };

        const response = await request(httpServer)
          .post('/projects')
          .send(inputPayload);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject(partialExpected);
      });

      it('should return 400 when creating with invalid name', async () => {
        const inputPayload = {
          name: { test: 'test' },
          description: 'description test',
          startDate: '2022-02-22',
        };

        const response = await request(httpServer)
          .post('/projects')
          .send(inputPayload);

        expect(response.status).toBe(400);
      });

      it('should return 400 when creating with invalid description', async () => {
        const inputPayload = {
          name: 'test',
          description: null,
          startDate: '2022-02-22',
        };

        const response = await request(httpServer)
          .post('/projects')
          .send(inputPayload);

        expect(response.status).toBe(400);
      });

      it('should return 400 when creating with invalid startDate', async () => {
        const inputPayload = {
          name: 'test',
          description: 'test description',
          startDate: 'invalid',
        };

        const response = await request(httpServer)
          .post('/projects')
          .send(inputPayload);

        expect(response.status).toBe(400);
      });

      it('should return 400 when creating with invalid endDate', async () => {
        const inputPayload = {
          name: 'test',
          description: 'test description',
          startDate: '2022-02-22',
          endDate: 'invalid',
        };

        const response = await request(httpServer)
          .post('/projects')
          .send(inputPayload);

        expect(response.status).toBe(400);
      });

      it('should return 400 when startDate is greater than endDate', async () => {
        const inputPayload = {
          name: 'test',
          description: 'test description',
          startDate: new Date('2022-02-22').getTime(),
          endDate: new Date(new Date('2022-02-22').getTime() - 1),
        };

        const response = await request(httpServer)
          .post('/projects')
          .send(inputPayload);

        expect(response.status).toBe(400);
        expect(response.body.message).toEqual(
          'startDate must be lesser than endDate',
        );
      });

      it('should return 400 when startDate is equal to endDate', async () => {
        const inputPayload = {
          name: 'test',
          description: 'test description',
          startDate: new Date('2022-02-22').getTime(),
          endDate: new Date('2022-02-22').getTime(),
        };

        const response = await request(httpServer)
          .post('/projects')
          .send(inputPayload);

        expect(response.status).toBe(400);
        expect(response.body.message).toEqual(
          'startDate must be lesser than endDate',
        );
      });

      it('should return 400 when name already exists', async () => {
        await dbConnection.collection('projects').insertOne({
          name: 'test',
          description: 'test description',
          startDate: new Date('2022-02-22').getTime(),
          active: true,
        });

        const inputPayload = {
          name: 'test',
          description: 'test description',
          startDate: new Date('2022-02-22').getTime(),
        };

        const response = await request(httpServer)
          .post('/projects')
          .send(inputPayload);

        expect(response.status).toBe(400);
        expect(response.body.message).toEqual(
          "The project's name already exists",
        );
      });
    });

    describe('/projects/:id (PATCH)', () => {
      it('should return 404 when the project is not found', async () => {
        const inputPayload = {
          name: 'test2',
        };

        const id = 'invalid_id';

        const response = await request(httpServer)
          .patch(`/projects/${id}`)
          .send(inputPayload);

        expect(response.status).toBe(404);
        expect(response.body.message).toEqual('Project not found');
      });

      it('should return 400 when name already exists', async () => {
        let response = await request(httpServer)
          .post('/projects')
          .send({
            name: 'test',
            description: 'test description',
            startDate: new Date('2022-02-22').getTime(),
            active: true,
          });

        const id = response.body._id;

        await request(httpServer)
          .post('/projects')
          .send({
            name: 'test2',
            description: 'test2 description',
            startDate: new Date('2022-02-22').getTime(),
            active: true,
          });

        const inputPayload = {
          name: 'test2',
        };

        response = await request(httpServer)
          .patch(`/projects/${id}`)
          .send(inputPayload);

        expect(response.status).toBe(400);
        expect(response.body.message).toEqual(
          "The project's name already exists",
        );
      });

      it('should return 400 when description is invalid', async () => {
        let response = await request(httpServer)
          .post('/projects')
          .send({
            name: 'test',
            description: 'test description',
            startDate: new Date('2022-02-22').getTime(),
            active: true,
          });

        const id = response.body._id;

        const inputPayload = {
          description: { invalid: 'invalid' },
        };

        response = await request(httpServer)
          .patch(`/projects/${id}`)
          .send(inputPayload);

        expect(response.status).toBe(400);
      });

      it('should return 400 when startDate is invalid', async () => {
        let response = await request(httpServer)
          .post('/projects')
          .send({
            name: 'test',
            description: 'test description',
            startDate: new Date('2022-02-22').getTime(),
            active: true,
          });

        const id = response.body._id;

        const inputPayload = {
          startDate: 'invalid',
        };

        response = await request(httpServer)
          .patch(`/projects/${id}`)
          .send(inputPayload);

        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('startDate must be a date');
      });

      it('should return 400 when endDate is invalid', async () => {
        let response = await request(httpServer)
          .post('/projects')
          .send({
            name: 'test',
            description: 'test description',
            startDate: new Date('2022-02-22').getTime(),
            active: true,
          });

        const id = response.body._id;

        const inputPayload = {
          endDate: 'invalid',
        };

        response = await request(httpServer)
          .patch(`/projects/${id}`)
          .send(inputPayload);

        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('endDate must be a date');
      });

      it('should return 400 when active is invalid', async () => {
        let response = await request(httpServer)
          .post('/projects')
          .send({
            name: 'test',
            description: 'test description',
            startDate: new Date('2022-02-22').getTime(),
            active: true,
          });

        const id = response.body._id;

        const inputPayload = {
          active: { invalid: 'invalid' },
        };

        response = await request(httpServer)
          .patch(`/projects/${id}`)
          .send(inputPayload);

        expect(response.status).toBe(400);
      });

      it('should return 400 when name is invalid', async () => {
        let response = await request(httpServer)
          .post('/projects')
          .send({
            name: 'test',
            description: 'test description',
            startDate: new Date('2022-02-22').getTime(),
            active: true,
          });

        const id = response.body._id;

        const inputPayload = {
          name: { invalid: 'invalid' },
        };

        response = await request(httpServer)
          .patch(`/projects/${id}`)
          .send(inputPayload);

        expect(response.status).toBe(400);
      });

      it('should return 400 when input startDate is greater than input endDate', async () => {
        let response = await request(httpServer)
          .post('/projects')
          .send({
            name: 'test',
            description: 'test description',
            startDate: new Date('2022-02-22').getTime(),
            active: true,
          });

        const id = response.body._id;

        const inputPayload = {
          startDate: new Date('2022-02-22'),
          endDate: new Date('2022-02-21'),
        };

        response = await request(httpServer)
          .patch(`/projects/${id}`)
          .send(inputPayload);

        expect(response.status).toBe(400);
        expect(response.body.message).toEqual(
          'startDate must be lesser than endDate',
        );
      });

      it('should return 400 when input startDate is equal to input endDate', async () => {
        let response = await request(httpServer)
          .post('/projects')
          .send({
            name: 'test',
            description: 'test description',
            startDate: new Date('2022-02-22').getTime(),
            active: true,
          });

        const id = response.body._id;

        const inputPayload = {
          startDate: new Date('2022-02-22'),
          endDate: new Date('2022-02-22'),
        };

        response = await request(httpServer)
          .patch(`/projects/${id}`)
          .send(inputPayload);

        expect(response.status).toBe(400);
        expect(response.body.message).toEqual(
          'startDate must be lesser than endDate',
        );
      });

      it('should return 400 when input startDate is greater than database endDate', async () => {
        let response = await request(httpServer)
          .post('/projects')
          .send({
            name: 'test',
            description: 'test description',
            startDate: new Date('2022-02-22').getTime(),
            endDate: new Date('2022-02-23'),
            active: true,
          });

        const id = response.body._id;

        const inputPayload = {
          startDate: new Date(new Date('2022-02-23').getTime() + 1),
        };

        response = await request(httpServer)
          .patch(`/projects/${id}`)
          .send(inputPayload);

        expect(response.status).toBe(400);
        expect(response.body.message).toEqual(
          'startDate must be lesser than endDate',
        );
      });

      it('should return 400 when input startDate is equal to database endDate', async () => {
        let response = await request(httpServer)
          .post('/projects')
          .send({
            name: 'test',
            description: 'test description',
            startDate: new Date('2022-02-22').getTime(),
            endDate: new Date('2022-02-23'),
            active: true,
          });

        const id = response.body._id;

        const inputPayload = {
          startDate: new Date('2022-02-23'),
        };

        response = await request(httpServer)
          .patch(`/projects/${id}`)
          .send(inputPayload);

        expect(response.status).toBe(400);
        expect(response.body.message).toEqual(
          'startDate must be lesser than endDate',
        );
      });

      it('should return 400 when input endDate is lesser than database startDate', async () => {
        let response = await request(httpServer)
          .post('/projects')
          .send({
            name: 'test',
            description: 'test description',
            startDate: new Date('2022-02-22').getTime(),
            endDate: new Date('2022-02-23'),
            active: true,
          });

        const id = response.body._id;

        const inputPayload = {
          endDate: new Date(new Date('2022-02-22').getTime() - 1),
        };

        response = await request(httpServer)
          .patch(`/projects/${id}`)
          .send(inputPayload);

        expect(response.status).toBe(400);
        expect(response.body.message).toEqual(
          'endDate must be greater than startDate',
        );
      });

      it('should return 400 when input endDate is equal to database startDate', async () => {
        let response = await request(httpServer)
          .post('/projects')
          .send({
            name: 'test',
            description: 'test description',
            startDate: new Date('2022-02-22').getTime(),
            endDate: new Date('2022-02-23'),
            active: true,
          });

        const id = response.body._id;

        const inputPayload = {
          endDate: new Date('2022-02-22'),
        };

        response = await request(httpServer)
          .patch(`/projects/${id}`)
          .send(inputPayload);

        expect(response.status).toBe(400);
        expect(response.body.message).toEqual(
          'endDate must be greater than startDate',
        );
      });

      it('should return 200 when a project is updated', async () => {
        let response = await request(httpServer)
          .post('/projects')
          .send({
            name: 'test',
            description: 'test description',
            startDate: new Date('2022-02-22').getTime(),
            endDate: new Date('2022-02-23'),
            active: true,
          });

        const id = response.body._id;

        const inputPayload = {
          name: 'test test',
          description: 'test description test',
          startDate: new Date('2022-02-25').toISOString(),
          endDate: new Date(new Date('2022-02-25').getTime() + 1).toISOString(),
          active: false,
        };

        const expected = inputPayload;

        response = await request(httpServer)
          .patch(`/projects/${id}`)
          .send(inputPayload);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(expected);
      });
    });

    describe('/projects/:id (GET)', () => {
      it('should return 200 when listing a project', async () => {
        let response = await request(httpServer)
          .post('/projects')
          .send({
            name: 'test',
            description: 'test description',
            startDate: new Date('2022-02-22').getTime(),
            active: true,
          });

        const id = response.body._id;

        const expected = {
          name: 'test',
          description: 'test description',
          startDate: new Date('2022-02-22').toISOString(),
          active: true,
        };

        response = await request(httpServer).get(`/projects/${id}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(expected);
      });

      it('should return 404 when the project does not exist', async () => {
        const id = 'invalid_id';

        const response = await request(httpServer).get(`/projects/${id}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toEqual('Project not found');
      });
    });

    describe('/projects (GET)', () => {
      it('should return 200 when listing the projects', async () => {
        let response = await request(httpServer)
          .post('/projects')
          .send({
            name: 'test',
            description: 'test description',
            startDate: new Date('2022-02-22').getTime(),
            active: true,
          });

        response = await request(httpServer).get(`/projects`);

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBe(1);
      });

      it('should return 200 when projects do not exist', async () => {
        const response = await request(httpServer).get(`/projects`);

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBe(0);
      });
    });
  });

  describe('Employees Resource', () => {
    describe('/employees (POST)', () => {
      it('should return 201 when creating with valid data', async () => {
        const inputPayload = {
          name: 'test',
          post: 'tester',
          admission: '2022-02-22',
        };

        const partialExpected = {
          name: 'test',
          post: 'tester',
          admission: new Date('2022-02-22').toISOString(),
          active: true,
          projects: [],
        };

        const response = await request(httpServer)
          .post('/employees')
          .send(inputPayload);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject(partialExpected);
      });

      it('should return 400 when employee already exists', async () => {
        await dbConnection.collection('employees').insertOne({
          name: 'test',
          post: 'any',
          admission: '2022-02-02',
        });

        const inputPayload = {
          name: 'test',
          post: 'tester',
          admission: '2022-02-22',
        };

        const response = await request(httpServer)
          .post('/employees')
          .send(inputPayload);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Employee already exists');
      });
    });

    describe('/employees/all (GET)', () => {
      it('should return 200 when listing the employees', async () => {
        await dbConnection.collection('employees').insertOne({
          name: 'test',
          post: 'tester',
          admission: new Date('2022-02-22').toISOString(),
          active: true,
          projects: [],
        });

        const partialExpected = [
          {
            name: 'test',
            post: 'tester',
            admission: new Date('2022-02-22').toISOString(),
            active: true,
            projects: [],
          },
        ];

        const response = await request(httpServer).get('/employees/all');

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(partialExpected);
      });
    });

    describe('/employees/:id (GET)', () => {
      it('should return 200 when listing the employee', async () => {
        await dbConnection.collection('employees').insertOne({
          _id: new Types.ObjectId('000000000000000000000001'),
          name: 'test',
          post: 'tester',
          admission: new Date('2022-02-22').toISOString(),
          active: true,
          projects: [],
        });

        const partialExpected = {
          name: 'test',
          post: 'tester',
          admission: new Date('2022-02-22').toISOString(),
          active: true,
          projects: [],
        };
        const response = await request(httpServer).get(
          '/employees/000000000000000000000001',
        );

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(partialExpected);
      });

      it('should return 404 when employee is not found', async () => {
        await dbConnection.collection('employees').insertOne({
          name: 'test',
          post: 'tester',
          admission: new Date('2022-02-22').toISOString(),
          active: true,
          projects: [],
        });

        const response = await request(httpServer).get(
          '/employees/000000000000000000000001',
        );

        expect(response.status).toBe(404);
        expect(response.body.message).toStrictEqual('Employee not found');
      });
    });

    describe('/employees/:id (PATCH)', () => {
      it('should return 200 when updating the employee', async () => {
        await dbConnection.collection('projects').insertOne({
          _id: new Types.ObjectId('00000000000000000000000a'),
          name: 'test',
          description: 'test description',
          startDate: new Date('2022-02-22').getTime(),
          active: true,
        });

        await dbConnection.collection('employees').insertOne({
          _id: new Types.ObjectId('000000000000000000000001'),
          name: 'test',
          post: 'tester',
          admission: new Date('2022-02-22').toISOString(),
          active: true,
          projects: ['00000000000000000000000a'],
        });

        const updateEmployeePayload = {
          name: 'Carlos Alberto',
          post: 'Desenvolvedor',
          admission: new Date('2022-02-23').toISOString(),
          active: true,
          projects: [],
        };

        const partialExpected = {
          name: 'Carlos Alberto',
          post: 'Desenvolvedor',
          admission: new Date('2022-02-23').toISOString(),
          active: true,
          projects: [],
        };
        const response = await request(httpServer)
          .patch('/employees/000000000000000000000001')
          .send(updateEmployeePayload);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(partialExpected);
      });

      it('should return 404 when the employee is not found', async () => {
        const updateEmployeePayload = {
          name: 'Carlos Alberto',
          post: 'Desenvolvedor',
          admission: new Date('2022-02-23').toISOString(),
          active: true,
          projects: [],
        };

        const response = await request(httpServer)
          .patch('/employees/000000000000000000000001')
          .send(updateEmployeePayload);

        expect(response.status).toBe(404);
        expect(response.body.message).toStrictEqual('Employee not found');
      });

      it('should return 400 when name already exists with another id', async () => {
        await dbConnection.collection('employees').insertOne({
          _id: new Types.ObjectId('000000000000000000000001'),
          name: 'Test',
          post: 'tester',
          admission: new Date('2022-02-22').toISOString(),
          active: true,
          projects: [],
        });

        await dbConnection.collection('employees').insertOne({
          _id: new Types.ObjectId('000000000000000000000002'),
          name: 'Carlos Alberto',
          post: 'tester',
          admission: new Date('2022-02-22').toISOString(),
          active: true,
          projects: [],
        });

        const updateEmployeePayload = {
          name: 'carlos Alberto',
          post: 'Desenvolvedor',
          admission: new Date('2022-02-23').toISOString(),
          active: true,
          projects: [],
        };

        const response = await request(httpServer)
          .patch('/employees/000000000000000000000001')
          .send(updateEmployeePayload);

        expect(response.status).toBe(400);
        expect(response.body.message).toStrictEqual('Name already exists');
      });

      it('should return 404 when a project is not found', async () => {
        await dbConnection.collection('projects').insertOne({
          _id: new Types.ObjectId('00000000000000000000000a'),
          name: 'test',
          description: 'test description',
          startDate: new Date('2022-02-22').getTime(),
          active: true,
        });

        await dbConnection.collection('employees').insertOne({
          _id: new Types.ObjectId('000000000000000000000001'),
          name: 'test',
          post: 'tester',
          admission: new Date('2022-02-22').toISOString(),
          active: true,
          projects: ['00000000000000000000000a'],
        });

        const updateEmployeePayload = {
          projects: ['00000000000000000000000a', '00000000000000000000000b'],
        };

        const response = await request(httpServer)
          .patch('/employees/000000000000000000000001')
          .send(updateEmployeePayload);

        expect(response.status).toBe(404);
        expect(response.body.message).toStrictEqual(
          'Project 00000000000000000000000b not found',
        );
      });
    });

    describe('/employees/:id (DELETE)', () => {
      it('should return 204 when deleting the employee', async () => {
        const employeeId = '000000000000000000000001';

        await dbConnection.collection('employees').insertOne({
          _id: new Types.ObjectId(employeeId),
          name: 'test',
          post: 'tester',
          admission: new Date('2022-02-22').toISOString(),
          active: true,
          projects: [],
        });

        const response = await request(httpServer).delete(
          `/employees/${employeeId}`,
        );

        const employee = await dbConnection
          .collection('employees')
          .findOne({ _id: new Types.ObjectId(employeeId) });

        expect(response.status).toBe(204);
        expect(employee).toBeFalsy();
      });

      it('should return 404 when the employee is not found', async () => {
        const employeeId = '000000000000000000000001';

        const response = await request(httpServer).delete(
          `/employees/${employeeId}`,
        );

        expect(response.status).toBe(404);
        expect(response.body.message).toStrictEqual('Employee not found');
      });
    });
  });
});
