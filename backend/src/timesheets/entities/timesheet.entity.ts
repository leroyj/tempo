import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TimesheetEntry } from './timesheet-entry.entity';

export enum TimesheetStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
}

@Entity('timesheets')
@Unique(['userId', 'weekStartDate'])
export class Timesheet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.timesheets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'week_start_date', type: 'date' })
  weekStartDate: Date;

  @Column({
    type: 'enum',
    enum: TimesheetStatus,
    default: TimesheetStatus.DRAFT,
  })
  status: TimesheetStatus;

  @Column({ name: 'total_days', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalDays: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => TimesheetEntry, (entry) => entry.timesheet, { cascade: true })
  entries: TimesheetEntry[];
}

