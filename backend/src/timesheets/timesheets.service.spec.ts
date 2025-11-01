import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimesheetsService } from './timesheets.service';
import { Timesheet } from './entities/timesheet.entity';
import { TimesheetEntry } from './entities/timesheet-entry.entity';
import { HolidaysService } from '../holidays/holidays.service';
import { User } from '../users/entities/user.entity';

describe('TimesheetsService', () => {
  let service: TimesheetsService;
  let timesheetRepository: Repository<Timesheet>;
  let entryRepository: Repository<TimesheetEntry>;

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
    timesheetRepository = module.get<Repository<Timesheet>>(getRepositoryToken(Timesheet));
    entryRepository = module.get<Repository<TimesheetEntry>>(getRepositoryToken(TimesheetEntry));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateTotalDays', () => {
    it('should throw error if total is not 5 days', async () => {
      const entries = [
        {
          monday: 1,
          tuesday: 1,
          wednesday: 1,
          thursday: 1,
          friday: 0.5,
          total: 4.5,
        } as TimesheetEntry,
      ];

      await expect(service['validateTotalDays'](entries)).rejects.toThrow(
        'Le total de la semaine doit être exactement 5 jours'
      );
    });
  });
});

