import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// allow any role-like value (enum, string, etc.)
export const Roles = (...roles: any[]) => SetMetadata(ROLES_KEY, roles);
