
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

/**
 * Normalizes role strings for comparison.
 * Handles both formats: 'HR_ADMIN' (underscore) and 'HR Admin' (space)
 * Converts underscores to spaces and normalizes case
 */
function normalizeRole(role: string): string {
  if (!role) return '';
  
  // Convert to lowercase and trim
  let normalized = role.toLowerCase().trim();
  
  // Replace underscores with spaces
  normalized = normalized.replace(/_/g, ' ');
  
  // Normalize multiple spaces to single space
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Handle special case for "legal & policy admin"
  normalized = normalized.replace(/legal\s*&\s*policy\s*admin/g, 'legal & policy admin');
  
  return normalized;
}

/**
 * Checks if a user role matches any of the required roles.
 * Handles both direct enum values and normalized string comparisons.
 */
function roleMatches(userRole: string, requiredRoles: Role[]): boolean {
  if (!userRole) return false;
  
  // First, try direct comparison (case-insensitive)
  const userRoleLower = userRole.toLowerCase().trim();
  for (const requiredRole of requiredRoles) {
    const requiredRoleStr = requiredRole.toString();
    if (userRoleLower === requiredRoleStr.toLowerCase()) {
      return true;
    }
  }
  
  // Then try normalized comparison
  const normalizedUserRole = normalizeRole(userRole);
  const normalizedRequiredRoles = requiredRoles.map(r => normalizeRole(r.toString()));
  
  return normalizedRequiredRoles.includes(normalizedUserRole);
}

@Injectable()
export class authorizationGaurd implements CanActivate {
  constructor(private reflector: Reflector) { }
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required, allow access
    }
    
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('No user attached to request');
    }
    
    const userRole = user.role as string;
    if (!userRole) {
      throw new ForbiddenException('User role not found');
    }
    
    // Debug logging (remove in production if needed)
    console.log('[Authorization Guard] Debug:', {
      userRole: userRole,
      userRoleType: typeof userRole,
      requiredRoles: requiredRoles.map(r => r.toString()),
      userObject: JSON.stringify(user),
    });
    
    // Check if user's role matches any of the required roles
    // Use improved role matching function
    if (!roleMatches(userRole, requiredRoles)) {
      throw new ForbiddenException(`Unauthorized access. Required roles: ${requiredRoles.map(r => r.toString()).join(', ')}, User role: ${userRole}`);
    }
       
    return true;
  }
}
