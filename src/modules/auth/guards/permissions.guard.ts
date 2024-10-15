import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PERMISSIONS_METADATA_KEY } from 'src/commons/decorators/permissions.decorator';
import { getClientPermissions } from '../helpers';
import { UserPermission } from 'src/commons/enums/permission.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredClientPermissions = this.reflector.getAllAndOverride<
      UserPermission[] | undefined
    >(PERMISSIONS_METADATA_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredClientPermissions || requiredClientPermissions.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const userPermissions = getClientPermissions(req.user);

    return requiredClientPermissions.some((permission) =>
      userPermissions.has(permission),
    );
  }
}
