import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestUser } from '../auth/jwt.strategy';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../common/prisma/prisma.service';
import { parseJsonObject, stringifyJson } from '../common/utils/json-column';

/**
 * Saved searches are a thin CRUD surface, so controller, service and DTOs live
 * together rather than being spread across five near-empty files.
 */

class UpsertSavedSearchDto {
  @ApiPropertyOptional({ example: 'PM roles in Bengaluru' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    description: 'A JobSearchDto-shaped object, replayed verbatim against /jobs.',
  })
  @IsObject()
  @IsOptional()
  filters?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  alertEnabled?: boolean;
}

@Injectable()
class SavedSearchesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const searches = await this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return searches.map((s) => this.serialize(s));
  }

  async create(userId: string, dto: UpsertSavedSearchDto) {
    const created = await this.prisma.savedSearch.create({
      data: {
        userId,
        name: dto.name,
        filters: stringifyJson(dto.filters ?? {}),
        alertEnabled: dto.alertEnabled ?? false,
      },
    });
    return this.serialize(created);
  }

  async update(userId: string, id: string, dto: UpsertSavedSearchDto) {
    await this.assertOwned(userId, id);

    const updated = await this.prisma.savedSearch.update({
      where: { id },
      data: {
        name: dto.name,
        ...(dto.filters !== undefined ? { filters: stringifyJson(dto.filters) } : {}),
        ...(dto.alertEnabled !== undefined ? { alertEnabled: dto.alertEnabled } : {}),
      },
    });
    return this.serialize(updated);
  }

  async remove(userId: string, id: string) {
    await this.assertOwned(userId, id);
    await this.prisma.savedSearch.delete({ where: { id } });
    return { id, deleted: true };
  }

  private async assertOwned(userId: string, id: string): Promise<void> {
    const found = await this.prisma.savedSearch.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!found) throw new NotFoundException('Saved search not found');
  }

  private serialize(search: { filters: string; [key: string]: unknown }) {
    return { ...search, filters: parseJsonObject(search.filters, {}) };
  }
}

@ApiTags('saved-searches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('saved-searches')
class SavedSearchesController {
  constructor(private readonly service: SavedSearchesService) {}

  @Get()
  @ApiOperation({ summary: 'List saved searches' })
  list(@CurrentUser() user: RequestUser) {
    return this.service.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: UpsertSavedSearchDto) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpsertSavedSearchDto,
  ) {
    return this.service.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.id, id);
  }
}

@Module({
  controllers: [SavedSearchesController],
  providers: [SavedSearchesService],
})
export class SavedSearchesModule {}
