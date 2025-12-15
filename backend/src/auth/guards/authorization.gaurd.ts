// ./src/auth/guards/authorization.gaurd.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/roles.enum';


@Injectable()
export class authorizationGaurd implements CanActivate {
  constructor(private reflector: Reflector) { }
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
      const { user } = context.switchToHttp().getRequest();
      if(!user)
        throw new ForbiddenException('no user attached');
      const userRole = user.role
      if (!requiredRoles.includes(userRole)) 
        throw new ForbiddenException('unauthorized access');
       
    return true;
  }
}
