import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserRepository } from './UserRepository';

export class UserRepositoryInMemory extends UserRepository {
  private static users: User[] = [];

  async findById(userId: string): Promise<User> {
    const user = UserRepositoryInMemory.users.find(
      (user) => user.id === userId,
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = UserRepositoryInMemory.users.find(
      (user) => user.username === username,
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll(): Promise<User[]> {
    return UserRepositoryInMemory.users;
  }

  async save(user: User): Promise<User> {
    const userExists = UserRepositoryInMemory.users.find(
      (u) => u.username === user.username,
    );
    if (userExists) throw new BadRequestException('User already exists');
    UserRepositoryInMemory.users.push(user);
    return user;
  }

  async update(id: string, user: User): Promise<User> {
    const userExists = await this.findById(id);
    const userWithSameUsername = UserRepositoryInMemory.users.find(
      (u) =>
        u.username.toLowerCase() === user.username.toLowerCase() &&
        u.id !== userExists.id,
    );
    if (userWithSameUsername)
      throw new BadRequestException('Username already in use');
    Object.assign(userExists, user);
    const index = UserRepositoryInMemory.users.findIndex(
      (u) => u.id === userExists.id,
    );
    UserRepositoryInMemory.users[index] = userExists;
    return userExists;
  }

  async delete(id: string): Promise<void> {
    const index = UserRepositoryInMemory.users.findIndex((u) => u.id === id);
    if (index === -1) throw new NotFoundException('User not found');
    UserRepositoryInMemory.users.splice(index, 1);
  }
}
