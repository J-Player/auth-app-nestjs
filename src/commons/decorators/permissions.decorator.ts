import { SetMetadata } from '@nestjs/common';
import { UserPermission } from '../enums/permission.enum';

export const PERMISSIONS_METADATA_KEY = 'permissions_decorator_key';

export const Permissions = (...permissions: UserPermission[]) =>
  SetMetadata(PERMISSIONS_METADATA_KEY, permissions);
