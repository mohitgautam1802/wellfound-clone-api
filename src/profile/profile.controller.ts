import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestUser } from '../auth/jwt.strategy';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  SetSkillsDto,
  UpdateCultureDto,
  UpdatePreferenceDto,
  UpdateProfileDto,
  UpsertEducationDto,
  UpsertExperienceDto,
} from './dto/profile.dto';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Full profile for the signed-in candidate' })
  get(@CurrentUser() user: RequestUser) {
    return this.profileService.getProfile(user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update the basics on the Profile tab' })
  update(@CurrentUser() user: RequestUser, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(user.id, dto);
  }

  // --- Work experience -----------------------------------------------------

  @Post('experiences')
  addExperience(@CurrentUser() user: RequestUser, @Body() dto: UpsertExperienceDto) {
    return this.profileService.addExperience(user.id, dto);
  }

  @Put('experiences/:id')
  updateExperience(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpsertExperienceDto,
  ) {
    return this.profileService.updateExperience(user.id, id, dto);
  }

  @Delete('experiences/:id')
  deleteExperience(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.profileService.deleteExperience(user.id, id);
  }

  // --- Education -----------------------------------------------------------

  @Post('educations')
  addEducation(@CurrentUser() user: RequestUser, @Body() dto: UpsertEducationDto) {
    return this.profileService.addEducation(user.id, dto);
  }

  @Put('educations/:id')
  updateEducation(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpsertEducationDto,
  ) {
    return this.profileService.updateEducation(user.id, id, dto);
  }

  @Delete('educations/:id')
  deleteEducation(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.profileService.deleteEducation(user.id, id);
  }

  // --- Skills / preferences / culture --------------------------------------

  @Put('skills')
  @ApiOperation({ summary: 'Replace the candidate skill list' })
  setSkills(@CurrentUser() user: RequestUser, @Body() dto: SetSkillsDto) {
    return this.profileService.setSkills(user.id, dto);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update the Preferences tab' })
  updatePreference(@CurrentUser() user: RequestUser, @Body() dto: UpdatePreferenceDto) {
    return this.profileService.updatePreference(user.id, dto);
  }

  @Patch('culture')
  @ApiOperation({ summary: 'Update the Culture tab' })
  updateCulture(@CurrentUser() user: RequestUser, @Body() dto: UpdateCultureDto) {
    return this.profileService.updateCulture(user.id, dto);
  }
}
