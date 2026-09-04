import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { parseJsonArray, stringifyJson } from '../common/utils/json-column';
import { slugify } from '../common/utils/slugify';
import {
  SetSkillsDto,
  UpdateCultureDto,
  UpdatePreferenceDto,
  UpdateProfileDto,
  UpsertEducationDto,
  UpsertExperienceDto,
} from './dto/profile.dto';
import { calculateCompletion } from './profile-completion';

// `satisfies` (rather than `as const`) keeps the literal types Prisma needs to
// infer the payload, while still type-checking the shape against the schema.
const PROFILE_INCLUDE = {
  experiences: { orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }] },
  educations: { orderBy: { endYear: 'desc' } },
  skills: { include: { skill: true } },
  preference: true,
  culture: true,
  user: { select: { id: true, name: true, email: true, avatarUrl: true } },
} satisfies Prisma.ProfileInclude;

type ProfileWithRelations = Prisma.ProfileGetPayload<{
  include: typeof PROFILE_INCLUDE;
}>;

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: PROFILE_INCLUDE,
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.serialize(profile);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profileId = await this.requireProfileId(userId);

    const { openToRoles, ...rest } = dto;

    await this.prisma.profile.update({
      where: { id: profileId },
      data: {
        ...rest,
        ...(openToRoles !== undefined
          ? { openToRoles: stringifyJson(openToRoles) }
          : {}),
      },
    });

    return this.getProfile(userId);
  }

  // -------------------------------------------------------------------------
  // Work experience
  // -------------------------------------------------------------------------

  async addExperience(userId: string, dto: UpsertExperienceDto) {
    const profileId = await this.requireProfileId(userId);
    await this.prisma.workExperience.create({
      data: { profileId, ...this.toExperienceData(dto) },
    });
    return this.getProfile(userId);
  }

  async updateExperience(userId: string, id: string, dto: UpsertExperienceDto) {
    const profileId = await this.requireProfileId(userId);
    await this.assertOwned('workExperience', id, profileId);

    await this.prisma.workExperience.update({
      where: { id },
      data: this.toExperienceData(dto),
    });
    return this.getProfile(userId);
  }

  async deleteExperience(userId: string, id: string) {
    const profileId = await this.requireProfileId(userId);
    await this.assertOwned('workExperience', id, profileId);

    await this.prisma.workExperience.delete({ where: { id } });
    return this.getProfile(userId);
  }

  // -------------------------------------------------------------------------
  // Education
  // -------------------------------------------------------------------------

  async addEducation(userId: string, dto: UpsertEducationDto) {
    const profileId = await this.requireProfileId(userId);
    await this.prisma.education.create({ data: { profileId, ...dto } });
    return this.getProfile(userId);
  }

  async updateEducation(userId: string, id: string, dto: UpsertEducationDto) {
    const profileId = await this.requireProfileId(userId);
    await this.assertOwned('education', id, profileId);

    await this.prisma.education.update({ where: { id }, data: dto });
    return this.getProfile(userId);
  }

  async deleteEducation(userId: string, id: string) {
    const profileId = await this.requireProfileId(userId);
    await this.assertOwned('education', id, profileId);

    await this.prisma.education.delete({ where: { id } });
    return this.getProfile(userId);
  }

  // -------------------------------------------------------------------------
  // Skills
  // -------------------------------------------------------------------------

  /**
   * Replaces the whole skill set in one transaction. The UI edits skills as a
   * single tag list, so a diffing endpoint would be more API surface than the
   * client can actually use.
   */
  async setSkills(userId: string, dto: SetSkillsDto) {
    const profileId = await this.requireProfileId(userId);

    const cleaned = dto.skills
      .map((s) => ({ ...s, name: s.name.trim() }))
      .filter((s) => s.name.length > 0);

    // Collapse case-insensitive duplicates so "React" and "react" don't both
    // try to attach to the same skill row and trip the composite primary key.
    const bySlug = new Map<string, { name: string; yearsOfExperience: number }>();
    for (const skill of cleaned) {
      bySlug.set(slugify(skill.name), {
        name: skill.name,
        yearsOfExperience: skill.yearsOfExperience ?? 0,
      });
    }

    await this.prisma.$transaction(async (tx) => {
      const skillIds: { skillId: string; yearsOfExperience: number }[] = [];

      for (const [slug, value] of bySlug) {
        const skill = await tx.skill.upsert({
          where: { slug },
          update: {},
          create: { slug, name: value.name },
        });
        skillIds.push({
          skillId: skill.id,
          yearsOfExperience: value.yearsOfExperience,
        });
      }

      await tx.profileSkill.deleteMany({ where: { profileId } });
      if (skillIds.length > 0) {
        await tx.profileSkill.createMany({
          data: skillIds.map((s) => ({ profileId, ...s })),
        });
      }
    });

    return this.getProfile(userId);
  }

  // -------------------------------------------------------------------------
  // Preferences & culture
  // -------------------------------------------------------------------------

  async updatePreference(userId: string, dto: UpdatePreferenceDto) {
    const profileId = await this.requireProfileId(userId);

    const data = {
      ...(dto.searchStatus !== undefined ? { searchStatus: dto.searchStatus } : {}),
      ...(dto.openToRemote !== undefined ? { openToRemote: dto.openToRemote } : {}),
      ...(dto.willingToRelocate !== undefined
        ? { willingToRelocate: dto.willingToRelocate }
        : {}),
      ...(dto.desiredSalaryMin !== undefined
        ? { desiredSalaryMin: dto.desiredSalaryMin }
        : {}),
      ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
      ...(dto.workAuthorization !== undefined
        ? { workAuthorization: dto.workAuthorization }
        : {}),
      ...(dto.desiredRoleTypes !== undefined
        ? { desiredRoleTypes: stringifyJson(dto.desiredRoleTypes) }
        : {}),
      ...(dto.desiredRoles !== undefined
        ? { desiredRoles: stringifyJson(dto.desiredRoles) }
        : {}),
      ...(dto.desiredLocations !== undefined
        ? { desiredLocations: stringifyJson(dto.desiredLocations) }
        : {}),
      ...(dto.desiredCompanySizes !== undefined
        ? { desiredCompanySizes: stringifyJson(dto.desiredCompanySizes) }
        : {}),
    };

    await this.prisma.jobPreference.upsert({
      where: { profileId },
      update: data,
      create: { profileId, ...data },
    });

    return this.getProfile(userId);
  }

  async updateCulture(userId: string, dto: UpdateCultureDto) {
    const profileId = await this.requireProfileId(userId);

    const data = {
      ...(dto.lookingFor !== undefined ? { lookingFor: dto.lookingFor } : {}),
      ...(dto.workEnvironment !== undefined
        ? { workEnvironment: dto.workEnvironment }
        : {}),
      ...(dto.remotePolicyImportance !== undefined
        ? { remotePolicyImportance: dto.remotePolicyImportance }
        : {}),
      ...(dto.quietOfficeImportance !== undefined
        ? { quietOfficeImportance: dto.quietOfficeImportance }
        : {}),
      ...(dto.importantFactors !== undefined
        ? { importantFactors: stringifyJson(dto.importantFactors) }
        : {}),
      ...(dto.marketsInterested !== undefined
        ? { marketsInterested: stringifyJson(dto.marketsInterested) }
        : {}),
      ...(dto.marketsExcluded !== undefined
        ? { marketsExcluded: stringifyJson(dto.marketsExcluded) }
        : {}),
    };

    await this.prisma.cultureProfile.upsert({
      where: { profileId },
      update: data,
      create: { profileId, ...data },
    });

    return this.getProfile(userId);
  }

  // -------------------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------------------

  private toExperienceData(dto: UpsertExperienceDto) {
    const startDate = new Date(dto.startDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : null;
    const isCurrent = dto.isCurrent ?? false;

    if (endDate && endDate < startDate) {
      throw new BadRequestException('End date cannot be before start date');
    }

    return {
      company: dto.company,
      title: dto.title,
      location: dto.location ?? null,
      description: dto.description ?? null,
      startDate,
      // A current role has no end date; keep the two fields from disagreeing.
      endDate: isCurrent ? null : endDate,
      isCurrent,
    };
  }

  private async requireProfileId(userId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile.id;
  }

  /**
   * Guards against a caller editing another candidate's rows by id. Returns 404
   * rather than 403 so the endpoint does not confirm that the id exists.
   */
  private async assertOwned(
    model: 'workExperience' | 'education',
    id: string,
    profileId: string,
  ): Promise<void> {
    // Branching beats indexing into `this.prisma[model]`: the two delegates are
    // structurally different enough that any shared cast has to be a lie.
    const found =
      model === 'workExperience'
        ? await this.prisma.workExperience.findFirst({
            where: { id, profileId },
            select: { id: true },
          })
        : await this.prisma.education.findFirst({
            where: { id, profileId },
            select: { id: true },
          });

    if (!found) {
      throw new NotFoundException('Record not found');
    }
  }

  /** Expands JSON-string columns and attaches the derived completion block. */
  private serialize(profile: ProfileWithRelations) {
    const completion = calculateCompletion({
      headline: profile.headline,
      location: profile.location,
      primaryRole: profile.primaryRole,
      bio: profile.bio,
      resumeFileName: profile.resumeFileName,
      experienceCount: profile.experiences.length,
      educationCount: profile.educations.length,
      skillCount: profile.skills.length,
      hasSocialLink: Boolean(
        profile.websiteUrl ||
        profile.githubUrl ||
        profile.linkedinUrl ||
        profile.twitterUrl,
      ),
      hasPreference: Boolean(profile.preference),
      hasCulture: Boolean(profile.culture),
    });

    return {
      ...profile,
      openToRoles: parseJsonArray(profile.openToRoles),
      skills: profile.skills.map((ps) => ({
        id: ps.skill.id,
        name: ps.skill.name,
        slug: ps.skill.slug,
        yearsOfExperience: ps.yearsOfExperience,
      })),
      preference: profile.preference
        ? {
            ...profile.preference,
            desiredRoleTypes: parseJsonArray(profile.preference.desiredRoleTypes),
            desiredRoles: parseJsonArray(profile.preference.desiredRoles),
            desiredLocations: parseJsonArray(profile.preference.desiredLocations),
            desiredCompanySizes: parseJsonArray(profile.preference.desiredCompanySizes),
          }
        : null,
      culture: profile.culture
        ? {
            ...profile.culture,
            importantFactors: parseJsonArray(profile.culture.importantFactors),
            marketsInterested: parseJsonArray(profile.culture.marketsInterested),
            marketsExcluded: parseJsonArray(profile.culture.marketsExcluded),
          }
        : null,
      completion,
    };
  }
}
