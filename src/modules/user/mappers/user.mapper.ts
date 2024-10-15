import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';

export class UserMapper {
  static toUser(user: CreateUserDto): User {
    return new User({
      username: user.username,
      password: user.password,
    });
  }
}
