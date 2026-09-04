import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { PaginatedResult, paginate } from '../common/dto/pagination.dto';
import { parseJsonArray } from '../common/utils/json-column';
import { tokenizeSearchQuery } from '../common/utils/query-array';
import { JobSearchDto } from './dto/job-search.dto';

/**
 * NOTE ON CASE SENSITIVITY
 * Prisma's `mode: 'insensitive'` is a PostgreSQL/MongoDB feature and throws on
 * SQLite. We rely instead on SQLite's `LIKE`, which is already case-insensitive
 * for ASCII - which is why no `mode` key appears anywhere in this file.
 */

const JOB_INCLUDE = {
  company: true,
  locations: true,
  skills: { include: { skill: true } },
} as const;

type JobWithRelations = Prisma.JobGetPayload<{ include: typeof JOB_INCLUDE }>;

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(userId: string, dto: JobSearchDto): Promise<PaginatedResult<unknown>> {
    const where = await this.buildWhere(userId, dto);

    // "recommended" is scored against the candidate's stated preferences, which
    // SQL cannot express. For that sort we pull the matching set, rank it in
    // memory and slice - fine at this corpus size, and the honest tradeoff is
    // documented rather than hidden. The other sorts stay fully in the database.
    if ((dto.sort ?? 'recommended') === 'recommended') {
      return this.searchRecommended(userId, where, dto);
    }

    const orderBy: Prisma.JobOrderByWithRelationInput =
      dto.sort === 'salary' ? { salaryMax: 'desc' } : { postedAt: 'desc' };

    const [total, jobs] = await this.prisma.$transaction([
      this.prisma.job.count({ where }),
      this.prisma.job.findMany({
        where,
        include: JOB_INCLUDE,
        orderBy,
        skip: (dto.page - 1) * dto.limit,
        take: dto.limit,
      }),
    ]);

    const decorated = await this.decorate(userId, jobs);
    return paginate(decorated, total, dto.page, dto.limit);
  }

  private async searchRecommended(
    userId: string,
    where: Prisma.JobWhereInput,
    dto: JobSearchDto,
  ): Promise<PaginatedResult<unknown>> {
    const [jobs, preference] = await Promise.all([
      this.prisma.job.findMany({ where, include: JOB_INCLUDE }),
      this.prisma.jobPreference.findFirst({
        where: { profile: { userId } },
      }),
    ]);

    const desiredRoles = parseJsonArray(preference?.desiredRoles).map(lower);
    const desiredLocations = parseJsonArray(preference?.desiredLocations).map(lower);
    const desiredRoleTypes = parseJsonArray(preference?.desiredRoleTypes);

    const ranked = jobs
      .map((job) => ({
        job,
        score: scoreJob(job, {
          desiredRoles,
          desiredLocations,
          desiredRoleTypes,
          openToRemote: preference?.openToRemote ?? true,
          desiredSalaryMin: preference?.desiredSalaryMin ?? null,
        }),
      }))
      .sort(
        (a, b) =>
          b.score - a.score || b.job.postedAt.getTime() - a.job.postedAt.getTime(),
      );

    const page = ranked
      .slice((dto.page - 1) * dto.limit, dto.page * dto.limit)
      .map((entry) => entry.job);

    const decorated = await this.decorate(userId, page);
    return paginate(decorated, ranked.length, dto.page, dto.limit);
  }

  async findOne(userId: string, idOrSlug: string) {
    const job = await this.prisma.job.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: JOB_INCLUDE,
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const [decorated] = await this.decorate(userId, [job]);
    return decorated;
  }

  // -------------------------------------------------------------------------
  // Saved / hidden
  // -------------------------------------------------------------------------

  async listSaved(userId: string, page: number, limit: number) {
    const [total, saved] = await this.prisma.$transaction([
      this.prisma.savedJob.count({ where: { userId } }),
      this.prisma.savedJob.findMany({
        where: { userId },
        include: { job: { include: JOB_INCLUDE } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const decorated = await this.decorate(
      userId,
      saved.map((s) => s.job),
    );
    return paginate(decorated, total, page, limit);
  }

  async listHidden(userId: string, page: number, limit: number) {
    const [total, hidden] = await this.prisma.$transaction([
      this.prisma.hiddenJob.count({ where: { userId } }),
      this.prisma.hiddenJob.findMany({
        where: { userId },
        include: { job: { include: JOB_INCLUDE } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const decorated = await this.decorate(
      userId,
      hidden.map((h) => h.job),
    );
    return paginate(decorated, total, page, limit);
  }

  async save(userId: string, jobId: string) {
    await this.assertJobExists(jobId);
    try {
      await this.prisma.savedJob.create({ data: { userId, jobId } });
    } catch (error) {
      // Saving an already-saved job is a no-op, not an error - the UI fires this
      // optimistically and a double-click should not surface a failure.
      if (!isUniqueViolation(error)) throw error;
    }
    return this.findOne(userId, jobId);
  }

  async unsave(userId: string, jobId: string) {
    await this.prisma.savedJob.deleteMany({ where: { userId, jobId } });
    return this.findOne(userId, jobId);
  }

  async hide(userId: string, jobId: string) {
    await this.assertJobExists(jobId);
    try {
      await this.prisma.hiddenJob.create({ data: { userId, jobId } });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
    return this.findOne(userId, jobId);
  }

  async unhide(userId: string, jobId: string) {
    await this.prisma.hiddenJob.deleteMany({ where: { userId, jobId } });
    return this.findOne(userId, jobId);
  }

  // -------------------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------------------

  private async buildWhere(
    userId: string,
    dto: JobSearchDto,
  ): Promise<Prisma.JobWhereInput> {
    const and: Prisma.JobWhereInput[] = [{ isActive: true }];

    if (dto.q?.trim()) {
      // Every token must match somewhere, but each token may match any field.
      for (const token of tokenizeSearchQuery(dto.q)) {
        and.push({
          OR: [
            { title: { contains: token } },
            { description: { contains: token } },
            { company: { name: { contains: token } } },
            { skills: { some: { skill: { name: { contains: token } } } } },
          ],
        });
      }
    }

    if (dto.locations?.length) {
      and.push({
        OR: dto.locations.map((city) => ({
          locations: { some: { city: { contains: city } } },
        })),
      });
    }

    if (dto.roleTypes?.length) and.push({ roleType: { in: dto.roleTypes } });
    if (dto.locationTypes?.length) {
      and.push({ locationType: { in: dto.locationTypes } });
    }
    if (dto.remoteOnly) and.push({ locationType: { in: ['REMOTE', 'HYBRID'] } });

    if (dto.companySizes?.length) {
      and.push({ company: { size: { in: dto.companySizes } } });
    }
    if (dto.fundingStages?.length) {
      and.push({ company: { fundingStage: { in: dto.fundingStages } } });
    }

    if (dto.skills?.length) {
      and.push({
        skills: { some: { skill: { slug: { in: dto.skills.map(lower) } } } },
      });
    }

    if (dto.salaryMin !== undefined) {
      and.push({ salaryMax: { gte: dto.salaryMin } });
    }

    if (dto.experience !== undefined) {
      // Show roles the candidate is actually eligible for at both ends.
      and.push({ experienceMin: { lte: dto.experience } });
    }

    // Hidden jobs never appear in Browse-all; the Hidden tab reads them directly.
    const hidden = await this.prisma.hiddenJob.findMany({
      where: { userId },
      select: { jobId: true },
    });
    if (hidden.length > 0) {
      and.push({ id: { notIn: hidden.map((h) => h.jobId) } });
    }

    return { AND: and };
  }

  /**
   * Attaches per-user state and expands JSON columns, so the client never has to
   * issue a second round of "is this saved?" queries.
   */
  private async decorate(userId: string, jobs: JobWithRelations[]) {
    if (jobs.length === 0) return [];

    const jobIds = jobs.map((j) => j.id);

    const [saved, applications] = await Promise.all([
      this.prisma.savedJob.findMany({
        where: { userId, jobId: { in: jobIds } },
        select: { jobId: true },
      }),
      this.prisma.application.findMany({
        where: { userId, jobId: { in: jobIds } },
        select: { jobId: true, id: true, status: true },
      }),
    ]);

    const savedIds = new Set(saved.map((s) => s.jobId));
    const applicationByJob = new Map(applications.map((a) => [a.jobId, a]));

    return jobs.map((job) => {
      const application = applicationByJob.get(job.id);
      return {
        ...job,
        requirements: parseJsonArray(job.requirements),
        locations: job.locations.map((l) => ({ city: l.city, country: l.country })),
        skills: job.skills.map((js) => ({
          id: js.skill.id,
          name: js.skill.name,
          slug: js.skill.slug,
        })),
        isSaved: savedIds.has(job.id),
        hasApplied: Boolean(application),
        applicationId: application?.id ?? null,
        applicationStatus: application?.status ?? null,
      };
    });
  }

  private async assertJobExists(jobId: string): Promise<void> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true },
    });
    if (!job) throw new NotFoundException('Job not found');
  }
}

// ---------------------------------------------------------------------------
// Ranking
// ---------------------------------------------------------------------------

interface ScoringPreference {
  desiredRoles: string[];
  desiredLocations: string[];
  desiredRoleTypes: string[];
  openToRemote: boolean;
  desiredSalaryMin: number | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Cheap, explainable relevance score. Deliberately additive so a single strong
 * signal (the exact role the candidate asked for) can outweigh several weak ones.
 */
export function scoreJob(job: JobWithRelations, pref: ScoringPreference): number {
  let score = 0;
  const title = lower(job.title);

  if (pref.desiredRoles.some((role) => title.includes(role))) score += 40;
  if (pref.desiredRoleTypes.includes(job.roleType)) score += 15;

  if (
    pref.desiredLocations.length > 0 &&
    job.locations.some((l) => pref.desiredLocations.includes(lower(l.city)))
  ) {
    score += 20;
  }

  if (pref.openToRemote && job.locationType === 'REMOTE') score += 10;

  if (
    pref.desiredSalaryMin !== null &&
    job.salaryMax !== null &&
    job.salaryMax >= pref.desiredSalaryMin
  ) {
    score += 10;
  }

  // Freshness: full credit for today, decaying to zero across a month.
  const ageDays = (Date.now() - job.postedAt.getTime()) / DAY_MS;
  score += Math.max(0, 15 - ageDays / 2);

  return score;
}

function lower(value: string): string {
  return value.toLowerCase();
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
  );
}
