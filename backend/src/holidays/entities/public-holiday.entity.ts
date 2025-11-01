import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Entity('public_holidays')
@Unique(['date', 'country'])
export class PublicHoliday {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  label: string;

  @Column({ default: 'FR' })
  country: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

