import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserMapper } from '../mappers/user.mapper';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  async findById(userId: string): Promise<User> {
    return this.userRepository.findById(userId);
  }

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findByUsername(username);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async save(userDto: CreateUserDto): Promise<User> {
    const user = UserMapper.toUser(userDto);
    user.password = await this.hashPassword(user.password);
    return this.userRepository.save(user);
  }

  async update(id: string, user: UpdateUserDto): Promise<User> {
    if (user.password) user.password = await this.hashPassword(user.password);
    const userToUpdate = await this.userRepository.findById(id);
    Object.assign(userToUpdate, user);
    return this.userRepository.update(id, userToUpdate);
  }

  async delete(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }

  async checkPassword(password: string, encrypted: string) {
    return bcrypt.compare(password, encrypted);
  }

  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }
}
