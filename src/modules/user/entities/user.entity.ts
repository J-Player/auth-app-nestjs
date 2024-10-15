import { randomUUID } from 'crypto';
import { AccountStatus } from 'src/commons/enums/account-status.enum';
import { Permission } from 'src/modules/auth/entities/permission.entity';
import { Role } from 'src/modules/auth/entities/role.entity';
import { Replace } from 'src/utils/replace';

export interface UserDetails {
  username: string;
  password: string;
  accountStatus: AccountStatus;
  roles?: Role[];
  permissions?: Permission[];
  createdAt: Date;
  updatedAt?: Date;
}

export class User {
  private readonly props: UserDetails;
  readonly id: string;
  constructor(
    props: Replace<
      UserDetails,
      { accountStatus?: AccountStatus; createdAt?: Date }
    >,
    id?: string,
  ) {
    this.props = {
      ...props,
      accountStatus: props.accountStatus ?? AccountStatus.Active,
      createdAt: props.createdAt ?? new Date(),
    };
    this.id = id ?? randomUUID();
  }

  public clone(id?: string): User {
    return new User(this.props, id);
  }

  public get username(): string {
    return this.props.username;
  }

  public set username(value: string) {
    this.props.username = value;
  }

  public get password(): string {
    return this.props.password;
  }

  public set password(value: string) {
    this.props.password = value;
  }

  public get accountStatus(): AccountStatus {
    return this.props.accountStatus;
  }

  public set accountStatus(value: AccountStatus) {
    this.props.accountStatus = value;
  }

  public get roles(): Role[] | undefined {
    return this.props.roles;
  }

  public set roles(value: Role[]) {
    this.props.roles = value;
  }

  public get permissions(): Permission[] | undefined {
    return this.props.permissions;
  }

  public set permissions(value: Permission[]) {
    this.props.permissions = value;
  }

  public get createdAt(): Date {
    return this.props.createdAt!;
  }

  public get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  public set updatedAt(value: Date | undefined) {
    this.props.updatedAt = value;
  }
}
