import { User } from '../entities/user.entity';

export abstract class UserRepository {
  abstract findById(userId: string): Promise<User>;
  abstract findByUsername(username: string): Promise<User>;
  abstract findAll(): Promise<User[]>;
  abstract save(user: User): Promise<User>;
  abstract update(id: string, user: User): Promise<User>;
  abstract delete(user: string): Promise<void>;
}
