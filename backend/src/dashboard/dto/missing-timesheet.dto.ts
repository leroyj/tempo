import { ApiProperty } from '@nestjs/swagger';
import { TimesheetStatus } from '../../timesheets/entities/timesheet.entity';

export class MissingTimesheetDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  userEmail: string;

  @ApiProperty()
  userFirstName: string;

  @ApiProperty()
  userLastName: string;

  @ApiProperty({ enum: TimesheetStatus, nullable: true })
  status: TimesheetStatus | null;

  @ApiProperty()
  isLate: boolean;

  @ApiProperty()
  hasTimesheet: boolean;
}

