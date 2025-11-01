import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { TimesheetsModule } from './timesheets/timesheets.module';
import { HolidaysModule } from './holidays/holidays.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { User } from './users/entities/user.entity';
import { Category } from './categories/entities/category.entity';
import { UserCategory } from './categories/entities/user-category.entity';
import { Timesheet } from './timesheets/entities/timesheet.entity';
import { TimesheetEntry } from './timesheets/entities/timesheet-entry.entity';
import { PublicHoliday } from './holidays/entities/public-holiday.entity';
import { seedAdmin } from './database/seed';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, Category, UserCategory, Timesheet, TimesheetEntry, PublicHoliday],
      synchronize: process.env.NODE_ENV === 'development', // À désactiver en production
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UsersModule,
    CategoriesModule,
    TimesheetsModule,
    HolidaysModule,
    DashboardModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async onModuleInit() {
    // Créer l'admin au démarrage si nécessaire
    await seedAdmin(this.dataSource);
  }
}

