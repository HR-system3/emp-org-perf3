import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { Request } from 'express';
  import { Reflector } from '@nestjs/core';
  import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(
      private jwtService: JwtService,
      private reflector: Reflector,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      // allow @Public() routes
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isPublic) return true;
  
      const request = context.switchToHttp().getRequest<Request>();
      const token = this.extractToken(request);
  
      if (!token) {
        throw new UnauthorizedException('No token, please login');
      }
  
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET,
        });
  
        // attach user payload to request so /auth/me can read it
        (request as any).user = payload;
        return true;
      } catch {
        throw new UnauthorizedException('Invalid or expired token');
      }
    }
  
    private extractToken(req: Request): string | undefined {
      // 1) from cookie (after cookie-parser)
      if ((req as any).cookies?.token) {
        console.log('[AuthGuard] Token found in cookie');
        return (req as any).cookies.token;
      }
  
      // 2) from Authorization: Bearer <token>
      const authHeader = req.headers['authorization'];
      if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        console.log('[AuthGuard] Token found in Authorization header');
        return authHeader.slice(7);
      }
  
      console.log('[AuthGuard] No token found. Cookies:', (req as any).cookies, 'Auth header:', authHeader);
      return undefined;
    }
  }
  