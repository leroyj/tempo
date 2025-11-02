// Tests unitaires - nécessite @nestjs/testing
// Temporairement désactivé - réactiver après installation complète des dépendances
// Pour réactiver : décommenter le code ci-dessous et installer @nestjs/testing

export {}; // Fichier vide pour éviter les erreurs TypeScript

/*
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimesheetsService } from './timesheets.service';
import { Timesheet } from './entities/timesheet.entity';
import { TimesheetEntry } from './entities/timesheet-entry.entity';
import { HolidaysService } from '../holidays/holidays.service';

describe('TimesheetsService', () => {
  let service: TimesheetsService;

  const mockTimesheetRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockEntryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockHolidaysService = {
    isHoliday: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimesheetsService,
        {
          provide: getRepositoryToken(Timesheet),
          useValue: mockTimesheetRepository,
        },
        {
          provide: getRepositoryToken(TimesheetEntry),
          useValue: mockEntryRepository,
        },
        {
          provide: HolidaysService,
          useValue: mockHolidaysService,
        },
      ],
    }).compile();

    service = module.get<TimesheetsService>(TimesheetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
*/
