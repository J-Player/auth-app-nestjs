import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../commons/enums/user-role.enum';
import { User } from 'src/modules/user/entities/user.entity';
import { ROLES_KEY } from 'src/commons/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;
    const req = context.switchToHttp().getRequest();
    const user: User = req.user;
    const roles = user.roles?.map((role) => role.name) || [];
    return requiredRoles.some((role) =>
      roles.some((userRole) => userRole === role),
    );
  }
}
