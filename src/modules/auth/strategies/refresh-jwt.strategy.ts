import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import refreshJwtConfig from 'src/modules/configs/refresh-jwt.config';
import { JWTPayload } from 'src/modules/auth/types/JwtPayload';
import { UserService } from 'src/modules/user/services/user.service';
import { AccountStatus } from 'src/commons/enums/account-status.enum';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: refreshJwtConfiguration.secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JWTPayload) {
    // only runs if the token is valid and successfully verified.
    // If the token is valid, the validate method is called with the decoded payload.

    // Optionally, you can perform additional checks here, such as checking if
    // the user exists, is banned, whatever.
    const user = await this.userService.findById(payload.sub);

    if (!user) throw new UnauthorizedException();

    if (user.accountStatus !== AccountStatus.Active) {
      throw new UnauthorizedException(
        `${user.username}, account ${user.accountStatus}`,
      );
    }

    return user;
  }
}
