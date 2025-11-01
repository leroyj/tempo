import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { parse } from 'csv-parse/sync';
import { PublicHoliday } from './entities/public-holiday.entity';
import { CreateHolidayDto } from './dto/create-holiday.dto';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(PublicHoliday)
    private holidaysRepository: Repository<PublicHoliday>,
  ) {}

  async create(createHolidayDto: CreateHolidayDto): Promise<PublicHoliday> {
    const holiday = this.holidaysRepository.create({
      ...createHolidayDto,
      date: new Date(createHolidayDto.date),
      country: createHolidayDto.country || 'FR',
    });

    return await this.holidaysRepository.save(holiday);
  }

  async findAll(year?: number): Promise<PublicHoliday[]> {
    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      return await this.holidaysRepository.find({
        where: {
          date: Between(startDate, endDate),
        },
        order: { date: 'ASC' },
      });
    }

    return await this.holidaysRepository.find({
      order: { date: 'ASC' },
    });
  }

  async findOne(id: string): Promise<PublicHoliday> {
    const holiday = await this.holidaysRepository.findOne({ where: { id } });
    if (!holiday) {
      throw new NotFoundException(`Jour férié avec l'ID ${id} non trouvé`);
    }
    return holiday;
  }

  async findByDate(date: Date): Promise<PublicHoliday | null> {
    return await this.holidaysRepository.findOne({
      where: { date },
    });
  }

  async isHoliday(date: Date): Promise<boolean> {
    const holiday = await this.findByDate(date);
    return holiday !== null;
  }

  async remove(id: string): Promise<void> {
    const holiday = await this.findOne(id);
    await this.holidaysRepository.remove(holiday);
  }

  async importHolidays(holidays: CreateHolidayDto[]): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;

    for (const holidayDto of holidays) {
      try {
        await this.create(holidayDto);
        success++;
      } catch (error) {
        errors.push(`Erreur pour ${holidayDto.date}: ${error.message}`);
      }
    }

    return { success, errors };
  }

  /**
   * Import CSV de jours fériés
   * Format attendu: date,label,country
   * Structure extensible vers une source API externe (ex. API gouvernementale)
   */
  async importHolidaysFromCsv(file: Express.Multer.File): Promise<{ success: number; errors: string[] }> {
    if (!file) {
      throw new BadRequestException('Fichier CSV requis');
    }

    try {
      const records = parse(file.buffer.toString('utf-8'), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const holidays: CreateHolidayDto[] = records.map((record: any) => ({
        date: record.date || record.Date,
        label: record.label || record.Label,
        country: record.country || record.Country || 'FR',
      }));

      return await this.importHolidays(holidays);
    } catch (error) {
      throw new BadRequestException(`Erreur lors du parsing CSV: ${error.message}`);
    }
  }
}

