import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Timesheet } from '../timesheets/entities/timesheet.entity';
import { TimesheetEntry } from '../timesheets/entities/timesheet-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Timesheet, TimesheetEntry])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}

