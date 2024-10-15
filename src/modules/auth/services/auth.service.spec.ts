import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/services/user.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { TestBed } from '@automock/jest';

describe.only('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  const token = 'token';

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(AuthService).compile();
    service = unit;
    userService = unitRef.get(UserService);
    jwtService = unitRef.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('login', () => {
    it('should return access_token and refresh_token', async () => {
      const user = new User({
        username: 'username',
        password: await userService.hashPassword('password'),
      });
      jest.spyOn(userService, 'checkPassword').mockResolvedValue(true);
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(user);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);

      const result = await service.login(user.username, user.password);

      expect(result).toBeDefined();
      expect(result.access_token).toEqual(token);
      expect(result.refresh_token).toEqual(token);
    });

    it('should throw error if user not found', async () => {
      const user = new User({
        username: 'username',
        password: await userService.hashPassword('password'),
      });
      jest
        .spyOn(userService, 'findByUsername')
        .mockRejectedValue(new NotFoundException());
      await expect(service.login(user.username, user.password)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error if wrong password', async () => {
      const user = new User({
        username: 'username',
        password: await userService.hashPassword('password'),
      });
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(user);
      jest.spyOn(userService, 'checkPassword').mockResolvedValue(false);
      await expect(service.login(user.username, user.password)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('register', () => {
    it('should save user', async () => {
      const userDto: CreateUserDto = {
        username: 'username',
        password: 'password',
      };
      const user = new User({
        username: userDto.username,
        password: await userService.hashPassword(userDto.password),
      });
      await service.register(userDto.username, userDto.password);
      jest.spyOn(userService, 'save').mockResolvedValue(user);
      expect(userService.save).toHaveBeenCalledWith(userDto);
      expect(userService.save).toHaveBeenCalledTimes(1);
    });
    it('should throw error if user already exists', async () => {
      const user = new User({
        username: 'username',
        password: await userService.hashPassword('password'),
      });
      jest
        .spyOn(userService, 'save')
        .mockRejectedValue(new Error('User already exists'));
      await expect(
        service.register(user.username, user.password),
      ).rejects.toThrow();
    });
  });
});
