import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Public } from 'src/commons/decorators/public.decorator';
import { LocalAuthGuard } from 'src/modules/auth/guards/local-auth.guard';
import { Request } from 'express';
import { RefreshJwtAuthGuard } from 'src/modules/auth/guards/refresh-jwt-auth.guard';
import { JWTPayload } from 'src/modules/auth/types/JwtPayload';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: Request) {
    return req.user;
  }

  @Public()
  @Post('register')
  async register(@Body() authDto: { username: string; password: string }) {
    return this.authService.register(authDto.username, authDto.password);
  }

  @Post('refresh')
  @UseGuards(RefreshJwtAuthGuard)
  async refresh(@Req() req: Request) {
    return this.authService.refreshToken((req.user as JWTPayload)!);
  }
}
