import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { JWTPayload } from 'jose';
import { isUUID } from 'class-validator';
import { AuthenticatedRequest } from './authenticated-request';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const payload = await this.verifyToken(token);
    const userId = payload.sub;

    if (!userId || !isUUID(userId)) {
      throw new UnauthorizedException('Invalid authenticated user');
    }

    request.user = {
      id: userId,
      email: this.optionalString(payload.email),
      role: this.optionalString(payload.role),
    };

    return true;
  }

  private extractBearerToken(authorization?: string) {
    const [type, token] = authorization?.split(' ') ?? [];
    return type === 'Bearer' && token ? token : null;
  }

  private async verifyToken(token: string): Promise<JWTPayload> {
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;

    if (!jwtSecret) {
      throw new UnauthorizedException('Supabase auth is not configured');
    }

    try {
      const { jwtVerify } = await import('jose');
      const secret = new TextEncoder().encode(jwtSecret);
      const { payload } = await jwtVerify(token, secret);

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private optionalString(value: unknown) {
    return typeof value === 'string' ? value : undefined;
  }
}
