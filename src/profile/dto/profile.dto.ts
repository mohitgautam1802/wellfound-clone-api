import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  COMPANY_SIZES,
  ROLE_TYPES,
  SEARCH_STATUSES,
  WORK_AUTHORIZATIONS,
  WORK_ENVIRONMENTS,
} from '../../common/constants/domain';

export class UpdateProfileDto {
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(120) headline?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(2000) bio?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(120) location?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(40) phone?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(120) primaryRole?: string;
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  achievements?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  openToRoles?: string[];

  @ApiPropertyOptional() @IsUrl() @IsOptional() websiteUrl?: string;
  @ApiPropertyOptional() @IsUrl() @IsOptional() githubUrl?: string;
  @ApiPropertyOptional() @IsUrl() @IsOptional() linkedinUrl?: string;
  @ApiPropertyOptional() @IsUrl() @IsOptional() twitterUrl?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 60 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(60)
  @IsOptional()
  yearsOfExperience?: number;

  /** File name only - this clone stores no binaries. */
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(255)
  resumeFileName?: string;
}

export class UpsertExperienceDto {
  @ApiPropertyOptional() @IsString() @MaxLength(120) company!: string;
  @ApiPropertyOptional() @IsString() @MaxLength(120) title!: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(120) location?: string;
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(4000)
  description?: string;

  @ApiPropertyOptional({ example: '2022-01-01' })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({ example: '2024-06-30' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;
}

export class UpsertEducationDto {
  @ApiPropertyOptional() @IsString() @MaxLength(160) school!: string;
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(120) degree?: string;
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(120)
  fieldOfStudy?: string;
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ minimum: 1950, maximum: 2100 })
  @Type(() => Number)
  @IsInt()
  @Min(1950)
  @Max(2100)
  @IsOptional()
  startYear?: number;

  @ApiPropertyOptional({ minimum: 1950, maximum: 2100 })
  @Type(() => Number)
  @IsInt()
  @Min(1950)
  @Max(2100)
  @IsOptional()
  endYear?: number;
}

export class SkillInputDto {
  @ApiPropertyOptional() @IsString() @MaxLength(60) name!: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 60 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(60)
  @IsOptional()
  yearsOfExperience?: number;
}

export class SetSkillsDto {
  @ApiPropertyOptional({ type: [SkillInputDto] })
  @IsArray()
  @Type(() => SkillInputDto)
  skills!: SkillInputDto[];
}

export class UpdatePreferenceDto {
  @ApiPropertyOptional({ enum: SEARCH_STATUSES })
  @IsIn(SEARCH_STATUSES)
  @IsOptional()
  searchStatus?: string;

  @ApiPropertyOptional({ enum: ROLE_TYPES, isArray: true })
  @IsArray()
  @IsIn(ROLE_TYPES, { each: true })
  @IsOptional()
  desiredRoleTypes?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  desiredRoles?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  desiredLocations?: string[];

  @ApiPropertyOptional({ enum: COMPANY_SIZES, isArray: true })
  @IsArray()
  @IsIn(COMPANY_SIZES, { each: true })
  @IsOptional()
  desiredCompanySizes?: string[];

  @ApiPropertyOptional({ enum: WORK_AUTHORIZATIONS })
  @IsIn(WORK_AUTHORIZATIONS)
  @IsOptional()
  workAuthorization?: string;

  @ApiPropertyOptional() @IsBoolean() @IsOptional() openToRemote?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() willingToRelocate?: boolean;

  @ApiPropertyOptional({ minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  desiredSalaryMin?: number;

  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(8) currency?: string;
}

export class UpdateCultureDto {
  @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(2000) lookingFor?: string;

  @ApiPropertyOptional({ enum: WORK_ENVIRONMENTS })
  @IsIn(WORK_ENVIRONMENTS)
  @IsOptional()
  workEnvironment?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  importantFactors?: string[];

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  remotePolicyImportance?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  quietOfficeImportance?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  marketsInterested?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  marketsExcluded?: string[];
}
