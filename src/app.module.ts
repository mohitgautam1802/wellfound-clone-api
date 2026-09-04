import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { ApplicationsModule } from './applications/applications.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { JobsModule } from './jobs/jobs.module';
import { ProfileModule } from './profile/profile.module';
import { SavedSearchesModule } from './saved-searches/saved-searches.module';

@ApiTags('health')
@Controller()
class HealthController {
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProfileModule,
    JobsModule,
    ApplicationsModule,
    CompaniesModule,
    SavedSearchesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
