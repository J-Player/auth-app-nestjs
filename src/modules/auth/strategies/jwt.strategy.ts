import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import jwtConfig from 'src/modules/configs/jwt.config';
import { JWTPayload } from 'src/modules/auth/types/JwtPayload';
import { AccountStatus } from 'src/commons/enums/account-status.enum';
import { UserService } from 'src/modules/user/services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfiguration.secret,
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
