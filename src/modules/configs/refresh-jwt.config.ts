import { registerAs } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';
import { Constraints } from 'src/commons/constraints';

export default registerAs(
  'refresh-jwt',
  (): JwtSignOptions => ({
    secret: process.env[Constraints.REFRESH_JWT_SECRET],
    expiresIn: process.env[Constraints.REFRESH_TOKEN_EXPIRATION],
  }),
);
