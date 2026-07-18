import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  @Get('me')
  getMe(@Req() req: Request) {
    return req.user;
  }
}
