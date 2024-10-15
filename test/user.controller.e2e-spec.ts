import {
  HttpStatus,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { AuthModule } from 'src/modules/auth/auth.module';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { UserController } from 'src/modules/user/controllers/user.controller';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/user/dto/update-user.dto';
import { UserRepository } from 'src/modules/user/repositories/UserRepository';
import { UserRepositoryInMemory } from 'src/modules/user/repositories/UserRepositoryInMemory';
import { UserService } from 'src/modules/user/services/user.service';
import { UserModule } from 'src/modules/user/user.module';
import * as request from 'supertest';
import { generateRandomAdmin, generateRandomUser } from './utils/user-util';
import { User } from 'src/modules/user/entities/user.entity';
import { UserPermission } from 'src/commons/enums/permission.enum';

describe('UserController', () => {
  let app: INestApplication;
  let controller: UserController;
  let userService: UserService;
  let authService: AuthService;
  let userRepository: UserRepository;

  type Auth = { access_token: string; refresh_token: string };

  let ADMIN_AUTH: Auth;
  let USER_AUTH: Auth;

  let user: User;
  let admin: User;

  const initializeDB = async () => {
    admin = await saveUser(generateRandomAdmin());
    user = await saveUser(generateRandomUser());
  };

  const removePermission = (user: User, permission: UserPermission) => {
    user.roles =
      user.roles?.filter(
        (r) => !r.permissions?.some((p) => p.name === permission),
      ) ?? [];
    user.permissions =
      user.permissions?.filter((p) => p.name !== permission) ?? [];
  };

  const saveUser = async (user: User) => {
    let userToSave = user.clone(user.id);
    userToSave.password = await userService.hashPassword(user.password);
    userToSave = await userRepository.save(userToSave);
    return user.clone(userToSave.id);
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule, AuthModule, ConfigModule.forRoot()],
    })
      .overrideProvider(UserRepository)
      .useClass(UserRepositoryInMemory)
      .compile();

    app = module.createNestApplication();

    controller = app.get<UserController>(UserController);
    userService = app.get<UserService>(UserService);
    authService = app.get<AuthService>(AuthService);
    userRepository = app.get<UserRepository>(UserRepository);
    await app.init();
    await initializeDB();
    ADMIN_AUTH = await authService.login(admin.username, admin.password);
    USER_AUTH = await authService.login(user.username, user.password);
  });

  afterAll(async () => {
    const ids = (await userRepository.findAll()).map((u) => u.id);
    console.log(`Total users: ${ids.length}`);
    for (const id of ids) {
      await userRepository.delete(id);
    }
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(userService).toBeDefined();
    expect(authService).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(ADMIN_AUTH).toBeDefined();
    expect(USER_AUTH).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = await request(app.getHttpServer())
        .get('/users/all')
        .auth(USER_AUTH.access_token, { type: 'bearer' });
      expect(result.status).toEqual(HttpStatus.OK);
      expect(result.body.length).toEqual((await userService.findAll()).length);
    });

    it('should throw error if user is not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/users/all')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should throw error if using refresh token as access token', async () => {
      await request(app.getHttpServer())
        .get('/users/all')
        .auth(USER_AUTH.refresh_token, { type: 'bearer' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const result = await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .auth(USER_AUTH.access_token, { type: 'bearer' });
      expect(result.status).toEqual(HttpStatus.OK);
      expect(result.body).toBeDefined();
    });

    it('should throw error if user not found', async () => {
      await request(app.getHttpServer())
        .get(`/users/${randomUUID()}`)
        .auth(USER_AUTH.access_token, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should throw error if using refresh token as access token', async () => {
      await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .auth(USER_AUTH.refresh_token, { type: 'bearer' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should throw error if user is not authenticated', async () => {
      await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('findByUsername', () => {
    it('should return user', async () => {
      const result = await request(app.getHttpServer())
        .get(`/users?username=${user.username}`)
        .auth(USER_AUTH.access_token, { type: 'bearer' });
      expect(result.status).toEqual(HttpStatus.OK);
      expect(result.body).toBeDefined();
    });

    it('should throw error if user not found', async () => {
      await request(app.getHttpServer())
        .get(`/users?username=${randomUUID()}`)
        .auth(USER_AUTH.access_token, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should throw error if using refresh token as access token', async () => {
      await request(app.getHttpServer())
        .get(`/users?username=${user.username}`)
        .auth(USER_AUTH.refresh_token, { type: 'bearer' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should throw error if user is not authenticated', async () => {
      await request(app.getHttpServer())
        .get(`/users?username=${user.username}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('save', () => {
    const userToSave: CreateUserDto = {
      username: 'new_user',
      password: 'random_password',
    };

    it('should save user if the user authenticated is a admin', async () => {
      const result = await request(app.getHttpServer())
        .post('/users')
        .auth(ADMIN_AUTH.access_token, { type: 'bearer' })
        .send(userToSave);
      expect(result.status).toEqual(HttpStatus.CREATED);
      expect(result.body).toHaveProperty('id');
    });

    it('should throw error if user has no required permission', async () => {
      let adminWithoutPermission = generateRandomAdmin();
      removePermission(adminWithoutPermission, UserPermission.CreateUser);
      adminWithoutPermission = await saveUser(adminWithoutPermission);
      const { access_token } = await authService.login(
        adminWithoutPermission.username,
        adminWithoutPermission.password,
      );

      await request(app.getHttpServer())
        .post('/users')
        .auth(access_token, { type: 'bearer' })
        .send(userToSave)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should throw error if user already exists', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .auth(ADMIN_AUTH.access_token, { type: 'bearer' })
        .send({
          username: user.username,
          password: 'random_password',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should throw error if using refresh token as access token', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .auth(ADMIN_AUTH.refresh_token, { type: 'bearer' })
        .send(userToSave)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should throw error if user is not admin', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .auth(USER_AUTH.access_token, { type: 'bearer' })
        .send({
          username: 'new_user',
          password: 'random_password',
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should throw error if user is not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          username: 'new_user',
          password: 'random_password',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('update', () => {
    let USER_TO_UPDATE_AUTH: Auth;
    let userToUpdate: User;

    const updateUserDto: UpdateUserDto = {
      username: 'new_username',
      password: 'new_password',
    };

    beforeAll(async () => {
      userToUpdate = generateRandomUser();
      const user = userToUpdate.clone();
      user.password = await userService.hashPassword(userToUpdate.password);
      await userRepository.save(user);
      userToUpdate = userToUpdate.clone(user.id);

      USER_TO_UPDATE_AUTH = await authService.login(
        userToUpdate.username,
        userToUpdate.password,
      );
    });

    it('should update user if user is admin', async () => {
      const result = await request(app.getHttpServer())
        .put(`/users/${userToUpdate.id}`)
        .auth(ADMIN_AUTH.access_token, { type: 'bearer' })
        .send(updateUserDto);
      expect(result.status).toEqual(HttpStatus.OK);
      expect(result.body.id).toEqual(userToUpdate.id);
    });

    it('should update user if the user is himself', async () => {
      const result = await request(app.getHttpServer())
        .put(`/users/${userToUpdate.id}`)
        .auth(USER_TO_UPDATE_AUTH.access_token, { type: 'bearer' })
        .send(updateUserDto);
      expect(result.status).toEqual(HttpStatus.OK);
      expect(result.body.id).toEqual(userToUpdate.id);
    });

    it('should throw error if user not found', async () => {
      await request(app.getHttpServer())
        .put(`/users/${randomUUID()}`)
        .auth(USER_TO_UPDATE_AUTH.access_token, { type: 'bearer' })
        .send(updateUserDto)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should throw error if user has no required permission', async () => {
      let adminWithoutPermission = generateRandomAdmin();
      removePermission(adminWithoutPermission, UserPermission.UpdateUser);
      adminWithoutPermission = await saveUser(adminWithoutPermission);
      const { access_token } = await authService.login(
        adminWithoutPermission.username,
        adminWithoutPermission.password,
      );

      await request(app.getHttpServer())
        .post('/users')
        .auth(access_token, { type: 'bearer' })
        .send(updateUserDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should throw error if username already in use', async () => {
      await request(app.getHttpServer())
        .put(`/users/${userToUpdate.id}`)
        .auth(USER_TO_UPDATE_AUTH.access_token, { type: 'bearer' })
        .send({
          username: user.username,
          password: updateUserDto.password,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should throw error if using refresh token as access token', async () => {
      await request(app.getHttpServer())
        .put(`/users/${userToUpdate.id}`)
        .auth(USER_TO_UPDATE_AUTH.refresh_token, { type: 'bearer' })
        .send(updateUserDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should throw error if user is not authenticated', async () => {
      await request(app.getHttpServer())
        .put(`/users/${userToUpdate.id}`)
        .send(updateUserDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('delete', () => {
    let userToDelete: User;
    let USER_TO_DELETE_AUTH: Auth;

    beforeAll(async () => {
      userToDelete = generateRandomUser();
      const user = userToDelete.clone();
      user.password = await userService.hashPassword(userToDelete.password);
      await userRepository.save(user);
      userToDelete = userToDelete.clone(user.id);

      USER_TO_DELETE_AUTH = await authService.login(
        userToDelete.username,
        userToDelete.password,
      );
    });

    beforeEach(async () => {
      try {
        await userRepository.findById(userToDelete.id);
      } catch (error) {
        if (error instanceof NotFoundException) {
          await userRepository.save(userToDelete);
        }
      }
    });

    it('should delete user if user is admin', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userToDelete.id}`)
        .auth(ADMIN_AUTH.access_token, { type: 'bearer' })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should delete user if the user is himself', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userToDelete.id}`)
        .auth(USER_TO_DELETE_AUTH.access_token, { type: 'bearer' })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should throw error if user not found', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${randomUUID()}`)
        .auth(USER_TO_DELETE_AUTH.access_token, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should throw error if user has no required permission', async () => {
      let adminWithoutPermission = generateRandomAdmin();
      removePermission(adminWithoutPermission, UserPermission.DeleteUser);
      adminWithoutPermission = await saveUser(adminWithoutPermission);
      const { access_token } = await authService.login(
        adminWithoutPermission.username,
        adminWithoutPermission.password,
      );

      await request(app.getHttpServer())
        .delete(`/users/${userToDelete.id}`)
        .auth(access_token, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should throw error if using refresh token as access token', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userToDelete.id}`)
        .auth(USER_TO_DELETE_AUTH.refresh_token, { type: 'bearer' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should throw error if user is not authenticated', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userToDelete.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
