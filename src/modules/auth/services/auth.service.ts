import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from 'src/modules/auth/types/JwtPayload';
import refreshJwtConfig from 'src/modules/configs/refresh-jwt.config';
import { UserService } from 'src/modules/user/services/user.service';

export type AuthToken = {
  access_token: string;
  refresh_token: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async login(username: string, password: string): Promise<AuthToken> {
    const user = await this.userService.findByUsername(username);
    const matched = await this.userService.checkPassword(
      password,
      user.password,
    );
    if (!matched) throw new BadRequestException();
    const payload: JWTPayload = {
      username: user.username,
      sub: user.id,
    };
    return {
      access_token: await this.generateAccessToken(payload),
      refresh_token: await this.generateRefreshToken(payload),
    };
  }

  async register(username: string, password: string): Promise<void> {
    try {
      await this.userService.save({
        username,
        password,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User already exists') {
          throw new BadRequestException(error);
        }
      }
    }
  }

  async refreshToken(payload: JWTPayload): Promise<AuthToken> {
    const user = await this.userService.findById(payload.sub);
    const newPayload: JWTPayload = {
      sub: user.id,
      username: user.username,
    };
    return {
      access_token: await this.generateAccessToken(newPayload),
      refresh_token: await this.generateRefreshToken(newPayload),
    };
  }

  private async generateAccessToken(payload: JWTPayload) {
    return this.jwtService.signAsync(payload);
  }

  private async generateRefreshToken(payload: JWTPayload) {
    return this.jwtService.signAsync(payload, this.refreshTokenConfig);
  }
}
