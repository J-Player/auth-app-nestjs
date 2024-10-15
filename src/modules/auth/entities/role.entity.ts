import { UserRole } from 'src/commons/enums/user-role.enum';
import { Permission } from './permission.entity';

export class Role {
  id: number;
  name: UserRole;
  permissions?: Permission[];
}
