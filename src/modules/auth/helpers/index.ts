import { UserRole } from 'src/commons/enums/user-role.enum';
import { User } from 'src/modules/user/entities/user.entity';

export function getClientPermissions(user: Partial<User>): Set<string> {
  // Extract all permissions from the user's roles
  const rolePermissions = new Set<string>(
    (user.roles ?? []).flatMap((role) =>
      (role.permissions ?? []).map((permission) => permission.name),
    ),
  );

  // Extract all directly assigned permissions
  const directPermissions = new Set<string>(
    (user.permissions ?? []).map((permission) => permission.name),
  );

  // Combine both sets of permissions
  return new Set<string>([...rolePermissions, ...directPermissions]);
}

export const userHasAnyRole = (user: User, roles: UserRole[]) => {
  return user.roles?.some((role) => roles.includes(role.name));
};
