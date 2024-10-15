import { randomUUID } from 'crypto';
import { UserPermission } from 'src/commons/enums/permission.enum';
import { UserRole } from 'src/commons/enums/user-role.enum';
import { Permission } from 'src/modules/auth/entities/permission.entity';
import { User } from 'src/modules/user/entities/user.entity';

const generatePermissions = (): Permission[] => {
  return [
    { id: 1, name: UserPermission.ReadUser },
    { id: 2, name: UserPermission.CreateUser },
    { id: 3, name: UserPermission.UpdateUser },
    { id: 4, name: UserPermission.DeleteUser },
  ];
};

export const generateRandomAdmin = () => {
  return new User({
    username: `admin_${randomUUID()}`,
    password: `password`,
    roles: [
      { id: 1, name: UserRole.Admin, permissions: generatePermissions() },
    ],
  });
};

export const generateRandomUser = () => {
  return new User({
    username: `user_${randomUUID()}`,
    password: `password`,
    roles: [{ id: 2, name: UserRole.User, permissions: generatePermissions() }],
  });
};
