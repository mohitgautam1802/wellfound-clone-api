import { Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestUser } from '../auth/jwt.strategy';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { JobSearchDto } from './dto/job-search.dto';
import { JobsService } from './jobs.service';

@ApiTags('jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'Search jobs (Browse all)' })
  search(@CurrentUser() user: RequestUser, @Query() dto: JobSearchDto) {
    return this.jobsService.search(user.id, dto);
  }

  // Declared before `:idOrSlug` so these literal paths are not swallowed by the
  // wildcard route.
  @Get('saved')
  @ApiOperation({ summary: 'Jobs on the Saved tab' })
  saved(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.jobsService.listSaved(user.id, query.page, query.limit);
  }

  @Get('hidden')
  @ApiOperation({ summary: 'Jobs on the Hidden tab' })
  hidden(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.jobsService.listHidden(user.id, query.page, query.limit);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Single job by id or slug' })
  findOne(@CurrentUser() user: RequestUser, @Param('idOrSlug') idOrSlug: string) {
    return this.jobsService.findOne(user.id, idOrSlug);
  }

  @Post(':id/save')
  save(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.jobsService.save(user.id, id);
  }

  @Delete(':id/save')
  unsave(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.jobsService.unsave(user.id, id);
  }

  @Post(':id/hide')
  hide(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.jobsService.hide(user.id, id);
  }

  @Delete(':id/hide')
  unhide(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.jobsService.unhide(user.id, id);
  }
}
