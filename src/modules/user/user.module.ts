import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { UserRepository } from './repositories/UserRepository';
import { UserRepositoryInMemory } from './repositories/UserRepositoryInMemory';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [CaslModule],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: UserRepository,
      useClass: UserRepositoryInMemory,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
