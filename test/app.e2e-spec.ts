import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection } from 'mongoose';
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
  });

  afterAll(async () => {
    await dbConnection.collection('projects').deleteMany({});
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
    });
  });
});
