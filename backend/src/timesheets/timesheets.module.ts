import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimesheetsService } from './timesheets.service';
import { TimesheetsController } from './timesheets.controller';
import { Timesheet } from './entities/timesheet.entity';
import { TimesheetEntry } from './entities/timesheet-entry.entity';
import { HolidaysModule } from '../holidays/holidays.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Timesheet, TimesheetEntry]),
    HolidaysModule,
  ],
  controllers: [TimesheetsController],
  providers: [TimesheetsService],
  exports: [TimesheetsService],
})
export class TimesheetsModule {}

