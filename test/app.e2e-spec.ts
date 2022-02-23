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
    });
  });
});
