import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

export interface SupabaseJwtPayload {
  sub: string;         // user UUID
  email?: string;
  phone?: string;
  role: string;        // 'authenticated' | 'anon'
  aud: string;
  exp: number;
  iat: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'supabase-jwt') {
  constructor() {
    const jwksUri = process.env.SUPABASE_JWKS_URI
      || (process.env.SUPABASE_URL
        ? `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`
        : null);

    if (!jwksUri) {
      throw new Error('Set SUPABASE_JWKS_URI or SUPABASE_URL in .env');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri,
      }),
    });
  }

  async validate(payload: SupabaseJwtPayload) {
    if (payload.role !== 'authenticated') {
      throw new UnauthorizedException('Token is not for an authenticated user.');
    }
    // Return the user object attached to req.user
    return {
      id: payload.sub,
      email: payload.email,
      phone: payload.phone,
    };
  }
}
