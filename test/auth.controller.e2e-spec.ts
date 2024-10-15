import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from 'src/modules/auth/auth.module';
import { AuthController } from 'src/modules/auth/controllers/auth.controller';
import { User } from 'src/modules/user/entities/user.entity';
import { UserRepository } from 'src/modules/user/repositories/UserRepository';
import { UserRepositoryInMemory } from 'src/modules/user/repositories/UserRepositoryInMemory';
import { UserService } from 'src/modules/user/services/user.service';
import * as request from 'supertest';

describe('AuthController', () => {
  let app: INestApplication;
  let controller: AuthController;
  let userService: UserService;
  const user = new User({
    username: 'username',
    password: 'password',
  });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, ConfigModule.forRoot()],
    })
      .overrideProvider(UserRepository)
      .useClass(UserRepositoryInMemory)
      .compile();

    app = module.createNestApplication();

    controller = app.get<AuthController>(AuthController);
    userService = app.get<UserService>(UserService);

    await app.init();
    await userService.save(user);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(userService).toBeDefined();
  });

  describe('login', () => {
    it('should return access_token and refresh_token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: user.username,
          password: user.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
    });

    it('should throw error if password is wrong', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: user.username,
          password: 'wrong_password',
        })
        .expect(400);
    });

    it('should throw error if user not found', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'username_not_found',
          password: 'password',
        })
        .expect(404);
    });
  });

  describe('register', () => {
    it('should save user', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'new_username',
          password: user.password,
        })
        .expect(201);
      expect(await userService.findByUsername('new_username')).toBeDefined();
    });

    it('should throw error if user already exists', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: user.username,
          password: user.password,
        })
        .expect(400);
    });
  });
});
