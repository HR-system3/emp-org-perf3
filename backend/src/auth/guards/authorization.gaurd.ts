
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
  
  // Normalize user role once
  const userRoleLower = userRole.toLowerCase().trim();
  const normalizedUserRole = normalizeRole(userRole);
  
  // Check each required role
  for (const requiredRole of requiredRoles) {
    const requiredRoleStr = requiredRole.toString();
    const requiredRoleLower = requiredRoleStr.toLowerCase().trim();
    const normalizedRequiredRole = normalizeRole(requiredRoleStr);
    
    // Try direct comparison (case-insensitive)
    if (userRoleLower === requiredRoleLower) {
      return true;
    }
    
    // Try normalized comparison
    if (normalizedUserRole === normalizedRequiredRole) {
      return true;
    }
    
    // Also check if enum key matches (e.g., "HR_ADMIN" matches Role.HR_ADMIN)
    const enumKey = Object.keys(Role).find(
      key => Role[key as keyof typeof Role] === requiredRoleStr
    );
    if (enumKey) {
      const enumKeyNormalized = normalizeRole(enumKey);
      if (normalizedUserRole === enumKeyNormalized) {
        return true;
      }
    }
  }
  
  return false;
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
    
    // Enhanced debug logging
    const normalizedUserRole = normalizeRole(userRole);
    const normalizedRequiredRoles = requiredRoles.map(r => normalizeRole(r.toString()));
    const directMatch = requiredRoles.some(r => {
      const requiredStr = r.toString().toLowerCase().trim();
      return userRole.toLowerCase().trim() === requiredStr;
    });
    const normalizedMatch = normalizedRequiredRoles.includes(normalizedUserRole);
    
    console.log('[Authorization Guard] Debug:', {
      userRole: userRole,
      normalizedUserRole: normalizedUserRole,
      requiredRoles: requiredRoles.map(r => r.toString()),
      normalizedRequiredRoles: normalizedRequiredRoles,
      directMatch: directMatch,
      normalizedMatch: normalizedMatch,
      willAllow: directMatch || normalizedMatch,
      userObject: JSON.stringify(user),
    });
    
    // Check if user's role matches any of the required roles
    // Use improved role matching function
    if (!roleMatches(userRole, requiredRoles)) {
      throw new ForbiddenException(
        `Unauthorized access. Required roles: ${requiredRoles.map(r => r.toString()).join(', ')}, ` +
        `User role: "${userRole}" (normalized: "${normalizedUserRole}"). ` +
        `Please ensure your user account has one of the required roles assigned.`
      );
    }
       
    return true;
  }
}
