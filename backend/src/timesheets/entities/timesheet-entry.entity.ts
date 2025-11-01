import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { Timesheet } from './timesheet.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('timesheet_entries')
@Check(`"monday" >= 0`)
@Check(`"tuesday" >= 0`)
@Check(`"wednesday" >= 0`)
@Check(`"thursday" >= 0`)
@Check(`"friday" >= 0`)
export class TimesheetEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'timesheet_id', type: 'uuid' })
  timesheetId: string;

  @ManyToOne(() => Timesheet, (timesheet) => timesheet.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'timesheet_id' })
  timesheet: Timesheet;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ nullable: true })
  subactivity: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  monday: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  tuesday: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  wednesday: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  thursday: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  friday: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  total: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

