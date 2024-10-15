import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
  MongoQuery,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Action } from 'src/commons/enums/action.enum';
import { UserRole } from 'src/commons/enums/user-role.enum';
import { userHasAnyRole } from 'src/modules/auth/helpers';
import { User } from 'src/modules/user/entities/user.entity';

type Subjects = InferSubjects<typeof User> | 'all';
type PossibleAbilities = [Action, Subjects];
type Conditions = MongoQuery;

export type AppAbility = MongoAbility<PossibleAbilities, Conditions>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );

    if (userHasAnyRole(user, [UserRole.Admin])) {
      can(Action.Manage, 'all'); // read-write access to everything
    } else {
      can(Action.Read, 'all'); // read-only access to everything
    }

    can([Action.ReadOwn, Action.UpdateOwn, Action.DeleteOwn], User, {
      id: user.id,
    });

    return build({
      // Read https://casl.js.org/v5/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
