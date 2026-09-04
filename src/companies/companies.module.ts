import {
  Controller,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationQueryDto, paginate } from '../common/dto/pagination.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { parseJsonArray } from '../common/utils/json-column';

/** Read-only company directory backing the company links on job cards. */

@Injectable()
class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(page: number, limit: number) {
    const [total, companies] = await this.prisma.$transaction([
      this.prisma.company.count(),
      this.prisma.company.findMany({
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { jobs: true } } },
      }),
    ]);

    return paginate(companies, total, page, limit);
  }

  async findOne(idOrSlug: string) {
    const company = await this.prisma.company.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        jobs: {
          where: { isActive: true },
          include: { locations: true },
          orderBy: { postedAt: 'desc' },
        },
      },
    });

    if (!company) throw new NotFoundException('Company not found');

    return {
      ...company,
      jobs: company.jobs.map((job) => ({
        ...job,
        requirements: parseJsonArray(job.requirements),
      })),
    };
  }
}

@ApiTags('companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
class CompaniesController {
  constructor(private readonly service: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'List companies' })
  list(@Query() query: PaginationQueryDto) {
    return this.service.list(query.page, query.limit);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Company profile with its open roles' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.service.findOne(idOrSlug);
  }
}

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
