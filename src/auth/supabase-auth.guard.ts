import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import type { AuthenticatedRequest } from './authenticated-request';

type SupabaseClientOptions = NonNullable<Parameters<typeof createClient>[2]>;
type RealtimeTransport = NonNullable<
  NonNullable<SupabaseClientOptions['realtime']>['transport']
>;

const webSocketTransport = WebSocket as unknown as RealtimeTransport;

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase?: SupabaseClient;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const { data, error } = await this.getSupabase().auth.getUser(token);
    const user = data.user;

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = {
      id: user.id,
      email: user.email,
    };

    return true;
  }

  private extractBearerToken(authorization?: string) {
    const [type, token] = authorization?.split(' ') ?? [];
    return type === 'Bearer' && token ? token : null;
  }

  private getSupabase() {
    if (this.supabase) {
      return this.supabase;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new UnauthorizedException('Supabase auth is not configured');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      realtime: {
        transport: webSocketTransport,
      },
    });

    return this.supabase;
  }
}
