import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  COMPANY_SIZES,
  FUNDING_STAGES,
  JOB_SORT_OPTIONS,
  LOCATION_TYPES,
  ROLE_TYPES,
} from '../../common/constants/domain';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TransformToArray, TransformToBoolean } from '../../common/utils/query-array';

export class JobSearchDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Free text. Double-quoted phrases are matched as a unit.',
    example: '"associate product manager"',
  })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({ type: [String], example: ['Bengaluru', 'Delhi'] })
  @TransformToArray()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  locations?: string[];

  @ApiPropertyOptional({ enum: ROLE_TYPES, isArray: true })
  @TransformToArray()
  @IsArray()
  @IsIn(ROLE_TYPES, { each: true })
  @IsOptional()
  roleTypes?: string[];

  @ApiPropertyOptional({ enum: LOCATION_TYPES, isArray: true })
  @TransformToArray()
  @IsArray()
  @IsIn(LOCATION_TYPES, { each: true })
  @IsOptional()
  locationTypes?: string[];

  @ApiPropertyOptional({ enum: COMPANY_SIZES, isArray: true })
  @TransformToArray()
  @IsArray()
  @IsIn(COMPANY_SIZES, { each: true })
  @IsOptional()
  companySizes?: string[];

  @ApiPropertyOptional({ enum: FUNDING_STAGES, isArray: true })
  @TransformToArray()
  @IsArray()
  @IsIn(FUNDING_STAGES, { each: true })
  @IsOptional()
  fundingStages?: string[];

  @ApiPropertyOptional({ type: [String], example: ['react', 'sql'] })
  @TransformToArray()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @ApiPropertyOptional({ description: 'Minimum of the posted salary range.' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  salaryMin?: number;

  @ApiPropertyOptional({ description: 'Candidate years of experience.' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  experience?: number;

  @ApiPropertyOptional({ description: 'Restrict to remote-friendly roles.' })
  @TransformToBoolean()
  @IsBoolean()
  @IsOptional()
  remoteOnly?: boolean;

  @ApiPropertyOptional({
    description:
      'Include roles that do not accept applicants from the candidate location.',
  })
  @TransformToBoolean()
  @IsBoolean()
  @IsOptional()
  worldwide?: boolean;

  @ApiPropertyOptional({ enum: JOB_SORT_OPTIONS, default: 'recommended' })
  @IsIn(JOB_SORT_OPTIONS)
  @IsOptional()
  sort?: string = 'recommended';
}
