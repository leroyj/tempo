import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { seedAdmin } from './seed';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { UserCategory } from '../categories/entities/user-category.entity';
import { Timesheet } from '../timesheets/entities/timesheet.entity';
import { TimesheetEntry } from '../timesheets/entities/timesheet-entry.entity';
import { PublicHoliday } from '../holidays/entities/public-holiday.entity';

config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Category, UserCategory, Timesheet, TimesheetEntry, PublicHoliday],
  synchronize: false,
  logging: true,
});

async function runMigrations() {
  try {
    await dataSource.initialize();
    console.log('Connexion à la base de données établie');

    // Créer l'admin si nécessaire
    await seedAdmin(dataSource);

    await dataSource.destroy();
    console.log('Migration terminée');
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    process.exit(1);
  }
}

runMigrations();

