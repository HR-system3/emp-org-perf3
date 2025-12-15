// ./src/auth/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/roles.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;
    
    const userRolesRaw = user.roles ?? user.role; // accept both
    if (!userRolesRaw) return false;
    
    const userRoles = Array.isArray(userRolesRaw) ? userRolesRaw : [userRolesRaw];
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}

