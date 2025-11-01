import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Timesheet } from '../../timesheets/entities/timesheet.entity';
import { UserCategory } from '../../categories/entities/user-category.entity';

export enum UserRole {
  USER = 'USER',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Timesheet, (timesheet) => timesheet.user)
  timesheets: Timesheet[];

  @OneToMany(() => UserCategory, (userCategory) => userCategory.user)
  userCategories: UserCategory[];

  // Méthode utilitaire pour obtenir le nom complet
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

