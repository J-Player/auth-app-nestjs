import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CurrentUser } from 'src/commons/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { Action } from 'src/commons/enums/action.enum';
import { CaslAbilityFactory } from 'src/modules/casl/casl-ability.factory/casl-ability.factory';
import { Permissions } from 'src/commons/decorators/permissions.decorator';
import { UserPermission } from 'src/commons/enums/permission.enum';
import { Roles } from 'src/commons/decorators/roles.decorator';
import { UserRole } from 'src/commons/enums/user-role.enum';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @Post()
  @Roles(UserRole.Admin)
  @Permissions(UserPermission.CreateUser)
  async save(@Body() createUserDto: CreateUserDto) {
    return this.userService.save(createUserDto);
  }

  @Get('all')
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get()
  async findByUsername(@Query('username') username: string) {
    return this.userService.findByUsername(username);
  }

  @Put(':id')
  @Permissions(UserPermission.UpdateUser)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
  ) {
    const ability = this.caslAbilityFactory.createForUser(user);
    const someUser = await this.findById(id);
    if (!ability.can(Action.UpdateOwn, someUser)) {
      throw new ForbiddenException(`Permission denied`);
    }

    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions(UserPermission.DeleteUser)
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    const ability = this.caslAbilityFactory.createForUser(user);
    const someUser = await this.findById(id);
    if (!ability.can(Action.DeleteOwn, someUser)) {
      throw new ForbiddenException(`Permission denied`);
    }

    return await this.userService.delete(id);
  }
}
