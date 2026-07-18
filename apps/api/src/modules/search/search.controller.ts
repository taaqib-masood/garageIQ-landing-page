import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { ResolveQueryDto } from './dto/resolve-query.dto';
import { Public } from '../auth/public.decorator';

@Public()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('resolve-query')
  async resolveQuery(@Body() dto: ResolveQueryDto) {
    return this.searchService.resolveQuery(dto.query);
  }

  @Post('query')
  async query(@Body() dto: SearchQueryDto) {
    return this.searchService.searchGarages(dto);
  }

  @Get('areas')
  async getAreas() {
    return this.searchService.getAreas();
  }
}
