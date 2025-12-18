import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
  import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AuthGuard } from '../auth/guards/authentication.guard';
import { authorizationGaurd } from '../auth/guards/authorization.gaurd';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/roles.enum';

@Controller('users')
@UseGuards(AuthGuard, authorizationGaurd)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.SYSTEM_ADMIN, Role.HR_MANAGER)
  async getAllUsers() {
    return this.usersService.getAll();
  }

  @Get(':id')
  @Roles(Role.SYSTEM_ADMIN, Role.HR_MANAGER)
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Password is already excluded by the service
    return user;
  }

  @Post()
  @Roles(Role.SYSTEM_ADMIN, Role.HR_MANAGER) // create user is System Admin and HR Manager
  async createUser(@Body() dto: CreateUserDto) {
    // Password is already excluded by the service
    return this.usersService.createUser(dto);
  }

  // Admin-only auth user creation (no employee profile)
  @Post('admin-create')
  @Roles(Role.SYSTEM_ADMIN, Role.HR_MANAGER)
  async adminCreateUser(@Body() dto: AdminCreateUserDto) {
    const user = await this.usersService.createUser(dto);
    return user;
  }

  @Patch(':id')
  @Roles(Role.SYSTEM_ADMIN)
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Patch(':id/assign-role')
  @Roles(Role.SYSTEM_ADMIN, Role.HR_MANAGER)
  async assignRole(@Param('id') id: string, @Body() dto: AssignRoleDto) {
    return this.usersService.assignRole(id, dto);
  }

  @Patch(':id/activate')
  @Roles(Role.SYSTEM_ADMIN)
  async activateUser(@Param('id') id: string) {
    return this.usersService.activateUser(id);
  }

  @Patch(':id/deactivate')
  @Roles(Role.SYSTEM_ADMIN)
  async deactivateUser(@Param('id') id: string) {
    return this.usersService.deactivateUser(id);
  }
}
