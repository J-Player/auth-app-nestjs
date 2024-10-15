import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { Constraints } from 'src/commons/constraints';

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: process.env[Constraints.JWT_SECRET],
    signOptions: {
      expiresIn: process.env[Constraints.ACCESS_TOKEN_EXPIRATION],
    },
  }),
);
