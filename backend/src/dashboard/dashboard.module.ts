import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { User } from '../users/entities/user.entity';
import { Timesheet } from '../timesheets/entities/timesheet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Timesheet])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

