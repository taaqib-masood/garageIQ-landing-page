import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { GaragesService } from './garages.service';

@Public()
@Controller('garages')
export class GaragesController {
  constructor(private readonly garagesService: GaragesService) {}

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.garagesService.findById(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.garagesService.findBySlug(slug);
  }
}
