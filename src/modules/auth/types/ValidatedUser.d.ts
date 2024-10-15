import { UserRole } from '../../../commons/enums/user-role.enum';

export type ValidatedUser = {
  userId: string;
  username: string;
  roles: UserRole[];
};
