import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CaslModule } from './modules/casl/casl.module';

@Module({
  imports: [AuthModule, UserModule, CaslModule],
})
export class AppModule {}
