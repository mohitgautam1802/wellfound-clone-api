import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { APPLICATION_STATUSES } from '../../common/constants/domain';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TransformToArray } from '../../common/utils/query-array';

export class CreateApplicationDto {
  @ApiProperty()
  @IsString()
  jobId!: string;

  @ApiPropertyOptional({
    description: 'The note Wellfound asks for on apply - effectively a cover letter.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  coverLetter?: string;

  @ApiPropertyOptional({ description: 'File name only; no binary is stored.' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  resumeFileName?: string;
}

export class ApplicationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: APPLICATION_STATUSES, isArray: true })
  @TransformToArray()
  @IsArray()
  @IsIn(APPLICATION_STATUSES, { each: true })
  @IsOptional()
  statuses?: string[];
}

export class WithdrawApplicationDto {
  @ApiPropertyOptional({ description: 'Optional reason recorded on the timeline.' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
