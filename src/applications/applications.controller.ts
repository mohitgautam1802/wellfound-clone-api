import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestUser } from '../auth/jwt.strategy';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApplicationsService } from './applications.service';
import {
  ApplicationQueryDto,
  CreateApplicationDto,
  WithdrawApplicationDto,
} from './dto/application.dto';

@ApiTags('applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Apply to a job' })
  apply(@CurrentUser() user: RequestUser, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.apply(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List the candidate applications (Applied page)' })
  list(@CurrentUser() user: RequestUser, @Query() query: ApplicationQueryDto) {
    return this.applicationsService.list(user.id, query);
  }

  // Literal path declared ahead of `:id`.
  @Get('stats')
  @ApiOperation({ summary: 'Counts per status for the Applied tab badges' })
  stats(@CurrentUser() user: RequestUser) {
    return this.applicationsService.stats(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.applicationsService.findOne(user.id, id);
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw an in-flight application' })
  withdraw(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: WithdrawApplicationDto,
  ) {
    return this.applicationsService.withdraw(user.id, id, dto);
  }
}
