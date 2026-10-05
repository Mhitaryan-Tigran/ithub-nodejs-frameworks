import { execSync } from 'node:child_process';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configure } from '../src/main.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    execSync('npx prisma migrate deploy', { env: process.env, stdio: 'ignore' });
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configure(app as any);
    await app.init();
    await app.get(PrismaService).user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('runs the full CRUD cycle', async () => {
    const server = app.getHttpServer();
    const created = await request(server).post('/users').send({ email: ' Alice@Test.dev ', name: 'Alice', password: 'Password123' }).expect(201);
    expect(created.body).toMatchObject({ email: 'alice@test.dev', name: 'Alice', role: 'USER' });
    expect(created.body.password).toBeUndefined();
    const id = created.body.id;
    await request(server).get('/users').expect(200).expect((res) => expect(res.body).toHaveLength(1));
    await request(server).patch(`/users/${id}`).send({ name: 'Alice Smith' }).expect(200).expect((res) => expect(res.body.name).toBe('Alice Smith'));
    await request(server).delete(`/users/${id}`).expect(204);
    await request(server).get(`/users/${id}`).expect(404);
  });

  it('validates input with class-validator', async () => {
    const res = await request(app.getHttpServer()).post('/users').send({ email: 'bad', name: 'A', password: 'short', extra: 1 }).expect(400);
    expect(res.body.message.join(' ')).toMatch(/email must be an email/);
    expect(res.body.message.join(' ')).toMatch(/property extra should not exist/);
    await request(app.getHttpServer()).get('/users/abc').expect(400);
  });

  it('returns 409 for a duplicate email', async () => {
    const server = app.getHttpServer();
    await request(server).post('/users').send({ email: 'bob@test.dev', name: 'Bob', password: 'Password123' }).expect(201);
    await request(server).post('/users').send({ email: 'bob@test.dev', name: 'Bob 2', password: 'Password123' }).expect(409);
  });

  it('serves Swagger docs with the users schema', async () => {
    const res = await request(app.getHttpServer()).get('/api/docs-json').expect(200);
    expect(Object.keys(res.body.paths)).toEqual(expect.arrayContaining(['/users', '/users/{id}']));
    expect(Object.keys(res.body.components.schemas)).toEqual(expect.arrayContaining(['CreateUserDto', 'UpdateUserDto', 'UserEntity']));
  });
});
