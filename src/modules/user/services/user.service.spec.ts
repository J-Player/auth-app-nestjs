import { UserService } from './user.service';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Test } from '@nestjs/testing';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;
  const user = new User({ username: 'username', password: 'password' });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            findByUsername: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return user', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(user);

      expect(await service.findById('id')).toEqual(user);
    });

    it('should throw error if user not found', async () => {
      jest
        .spyOn(repository, 'findById')
        .mockRejectedValue(new NotFoundException());

      await expect(service.findById('id')).rejects.toThrow();
    });
  });

  describe('findByUsername', () => {
    it('should return user', async () => {
      jest.spyOn(repository, 'findByUsername').mockResolvedValue(user);

      expect(await service.findByUsername('username')).toEqual(user);
    });

    it('should throw error if user not found', async () => {
      jest
        .spyOn(repository, 'findByUsername')
        .mockRejectedValue(new NotFoundException());

      await expect(service.findByUsername('username')).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([user]);

      expect(await service.findAll()).toEqual([user]);
    });
  });

  describe('save', () => {
    it('should save user', async () => {
      const userDto: CreateUserDto = {
        username: 'username',
        password: 'password',
      };
      jest.spyOn(repository, 'save').mockResolvedValue(user);

      expect(await service.save(userDto)).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const userDto: UpdateUserDto = {
        username: 'new_username',
        password: 'new_password',
      };
      const user = new User({
        username: 'username',
        password: await service.hashPassword('password'),
      });
      jest.spyOn(repository, 'findById').mockResolvedValue(user);
      jest.spyOn(repository, 'update').mockResolvedValue(user);

      const result = await service.update('id', userDto);
      expect(result).toBeDefined();
      expect(result.username).toEqual(userDto.username);
      expect(result.password).toEqual(userDto.password);
    });

    it('should throw error if user not found', async () => {
      const userDto: CreateUserDto = {
        username: 'username',
        password: 'password',
      };
      jest
        .spyOn(repository, 'findById')
        .mockRejectedValue(new NotFoundException());

      await expect(service.update('id', userDto)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue();
      await service.delete('id');
      expect(repository.delete).toHaveBeenCalledWith('id');
    });

    it('should throw error if user not found', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockRejectedValue(new NotFoundException());
      await expect(service.delete('id')).rejects.toThrow();
    });
  });
});
