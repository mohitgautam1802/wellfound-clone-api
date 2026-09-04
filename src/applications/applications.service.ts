import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  APPLICATION_EXPIRY_DAYS,
  APPLICATION_STATUSES,
  ApplicationStatus,
  TERMINAL_APPLICATION_STATUSES,
} from '../common/constants/domain';
import { paginate } from '../common/dto/pagination.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { parseJsonArray } from '../common/utils/json-column';
import {
  ApplicationQueryDto,
  CreateApplicationDto,
  WithdrawApplicationDto,
} from './dto/application.dto';

const APPLICATION_INCLUDE = {
  job: {
    include: {
      company: true,
      locations: true,
    },
  },
  events: { orderBy: { createdAt: 'desc' } },
} as const;

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(userId: string, dto: CreateApplicationDto) {
    const job = await this.prisma.job.findUnique({
      where: { id: dto.jobId },
      select: { id: true, isActive: true },
    });

    if (!job) throw new NotFoundException('Job not found');
    if (!job.isActive) {
      throw new BadRequestException('This job is no longer accepting applications');
    }

    // Fall back to the resume already on the profile so the client does not have
    // to re-send it on every apply.
    const resumeFileName =
      dto.resumeFileName ??
      (
        await this.prisma.profile.findUnique({
          where: { userId },
          select: { resumeFileName: true },
        })
      )?.resumeFileName ??
      null;

    try {
      const application = await this.prisma.$transaction(async (tx) => {
        const created = await tx.application.create({
          data: {
            userId,
            jobId: dto.jobId,
            status: 'APPLIED',
            coverLetter: dto.coverLetter ?? null,
            resumeFileName,
            expiresAt: expiryFromNow(),
            events: {
              create: { status: 'APPLIED', note: 'Application submitted' },
            },
          },
          include: APPLICATION_INCLUDE,
        });

        // Denormalised counter shown on the job card; kept in the same
        // transaction so it can never drift from the application rows.
        await tx.job.update({
          where: { id: dto.jobId },
          data: { applicantCount: { increment: 1 } },
        });

        return created;
      });

      return this.serialize(application);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('You have already applied to this job');
      }
      throw error;
    }
  }

  async list(userId: string, query: ApplicationQueryDto) {
    const where: Prisma.ApplicationWhereInput = {
      userId,
      ...(query.statuses?.length ? { status: { in: query.statuses } } : {}),
    };

    const [total, applications] = await this.prisma.$transaction([
      this.prisma.application.count({ where }),
      this.prisma.application.findMany({
        where,
        include: APPLICATION_INCLUDE,
        orderBy: { appliedAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
    ]);

    return paginate(
      applications.map((a) => this.serialize(a)),
      total,
      query.page,
      query.limit,
    );
  }

  async findOne(userId: string, id: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, userId },
      include: APPLICATION_INCLUDE,
    });

    if (!application) throw new NotFoundException('Application not found');
    return this.serialize(application);
  }

  /**
   * Wellfound itself does not let you un-apply, so this marks the application
   * WITHDRAWN and records the reason on the timeline rather than deleting the
   * row - the company still sees that an application happened.
   */
  async withdraw(userId: string, id: string, dto: WithdrawApplicationDto) {
    const existing = await this.prisma.application.findFirst({
      where: { id, userId },
      select: { id: true, status: true },
    });

    if (!existing) throw new NotFoundException('Application not found');

    if (TERMINAL_APPLICATION_STATUSES.includes(existing.status as ApplicationStatus)) {
      throw new BadRequestException(
        `Cannot withdraw an application that is already ${existing.status}`,
      );
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        status: 'WITHDRAWN',
        withdrawnAt: new Date(),
        expiresAt: null,
        events: {
          create: {
            status: 'WITHDRAWN',
            note: dto.reason ?? 'Withdrawn by candidate',
          },
        },
      },
      include: APPLICATION_INCLUDE,
    });

    return this.serialize(updated);
  }

  /** Counts per status, powering the tab badges on the Applied page. */
  async stats(userId: string) {
    const grouped = await this.prisma.application.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true },
    });

    const counts = Object.fromEntries(
      APPLICATION_STATUSES.map((status) => [status, 0]),
    ) as Record<ApplicationStatus, number>;

    for (const row of grouped) {
      counts[row.status as ApplicationStatus] = row._count.status;
    }

    const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
    const archived = TERMINAL_APPLICATION_STATUSES.reduce(
      (sum, status) => sum + counts[status],
      0,
    );

    return { total, active: total - archived, archived, byStatus: counts };
  }

  private serialize(application: {
    expiresAt: Date | null;
    status: string;
    job: { requirements: string; [key: string]: unknown };
    [key: string]: unknown;
  }) {
    const isTerminal = TERMINAL_APPLICATION_STATUSES.includes(
      application.status as ApplicationStatus,
    );

    const daysUntilExpiry =
      application.expiresAt && !isTerminal
        ? Math.ceil(
            (application.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000),
          )
        : null;

    return {
      ...application,
      job: {
        ...application.job,
        requirements: parseJsonArray(application.job.requirements),
      },
      isArchived: isTerminal,
      daysUntilExpiry,
      // Mirrors the nudge Wellfound shows before an application lapses.
      isExpiringSoon: daysUntilExpiry !== null && daysUntilExpiry <= 3,
      isExpired: daysUntilExpiry !== null && daysUntilExpiry <= 0,
    };
  }
}

function expiryFromNow(): Date {
  const date = new Date();
  date.setDate(date.getDate() + APPLICATION_EXPIRY_DAYS);
  return date;
}
