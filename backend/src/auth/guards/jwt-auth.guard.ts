import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

// Simplified JWT Auth Guard - extracts user from request
// In production, this would validate JWT token
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // For now, we'll accept if user exists in request
    // In production, validate JWT token here
    if (!user) {
      // Try to extract from headers if available
      // This is a placeholder - implement actual JWT validation
      throw new UnauthorizedException('Authentication required');
    }

    // Attach user info to request if not already present
    // Expected format: { userId: ObjectId, employeeId: ObjectId, roles: string[] }
    if (!request.user.userId && !request.user.employeeId) {
      throw new UnauthorizedException('Invalid user session');
    }

    return true;
  }
}

