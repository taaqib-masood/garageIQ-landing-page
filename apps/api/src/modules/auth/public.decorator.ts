import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/**
 * Decorate any controller or handler with @Public() to bypass JWT auth.
 * Example: search endpoints, garage listings — no login required.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
