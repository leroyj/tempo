import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Timesheet, TimesheetStatus } from './entities/timesheet.entity';
import { TimesheetEntry } from './entities/timesheet-entry.entity';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { UpdateTimesheetDto } from './dto/update-timesheet.dto';
import { HolidaysService } from '../holidays/holidays.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TimesheetsService {
  constructor(
    @InjectRepository(Timesheet)
    private timesheetsRepository: Repository<Timesheet>,
    @InjectRepository(TimesheetEntry)
    private entriesRepository: Repository<TimesheetEntry>,
    private holidaysService: HolidaysService,
  ) {}

  /**
   * Règle métier : Le total d'une semaine doit être exactement 5 jours
   * On autorise une petite tolérance pour les erreurs de calcul flottant (0.01 jour)
   */
  private readonly TOTAL_WEEK_DAYS = 5;
  private readonly FLOAT_TOLERANCE = 0.01;

  private calculateTotal(entries: TimesheetEntry[]): number {
    return entries.reduce((sum, entry) => {
      return (
        sum +
        Number(entry.monday) +
        Number(entry.tuesday) +
        Number(entry.wednesday) +
        Number(entry.thursday) +
        Number(entry.friday)
      );
    }, 0);
  }

  private async validateTotalDays(entries: TimesheetEntry[]): Promise<void> {
    const total = this.calculateTotal(entries);

    if (Math.abs(total - this.TOTAL_WEEK_DAYS) > this.FLOAT_TOLERANCE) {
      throw new BadRequestException(
        `Le total de la semaine doit être exactement ${this.TOTAL_WEEK_DAYS} jours. Total actuel : ${total.toFixed(2)} jours`,
      );
    }
  }

  private calculateEntryTotal(entry: any): number {
    return (
      Number(entry.monday) +
      Number(entry.tuesday) +
      Number(entry.wednesday) +
      Number(entry.thursday) +
      Number(entry.friday)
    );
  }

  private getMondayOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour lundi = 1
    return new Date(d.setDate(diff));
  }

  async create(userId: string, createTimesheetDto: CreateTimesheetDto): Promise<Timesheet> {
    const weekStartDate = new Date(createTimesheetDto.weekStartDate);

    // Vérifier si une feuille existe déjà
    const existing = await this.timesheetsRepository.findOne({
      where: { userId, weekStartDate },
    });

    if (existing) {
      throw new BadRequestException('Une feuille de temps existe déjà pour cette semaine');
    }

    // Créer la feuille
    const timesheet = this.timesheetsRepository.create({
      userId,
      weekStartDate,
      status: createTimesheetDto.status || TimesheetStatus.DRAFT,
    });

    const savedTimesheet = await this.timesheetsRepository.save(timesheet);

    // Créer les entrées
    const entries = createTimesheetDto.entries.map((entryDto) => {
      const entry = this.entriesRepository.create({
        timesheetId: savedTimesheet.id,
        categoryId: entryDto.categoryId,
        subactivity: entryDto.subactivity,
        monday: entryDto.monday,
        tuesday: entryDto.tuesday,
        wednesday: entryDto.wednesday,
        thursday: entryDto.thursday,
        friday: entryDto.friday,
        total: this.calculateEntryTotal(entryDto),
      });
      return entry;
    });

    await this.entriesRepository.save(entries);

    // Vérifier le total
    // Recharger la feuille avec les entrées
    const reloaded = await this.timesheetsRepository.findOne({
      where: { id: savedTimesheet.id },
      relations: ['entries'],
    });
    
    if (!reloaded) {
      throw new NotFoundException('Feuille de temps non trouvée après création');
    }
    
    await this.validateTotalDays(reloaded.entries);

    // Mettre à jour le total de la feuille
    const totalDays = this.calculateTotal(reloaded.entries);
    reloaded.totalDays = totalDays;
    await this.timesheetsRepository.save(reloaded);

    return reloaded;
  }

  async findAll(userId: string, userRole: string): Promise<Timesheet[]> {
    // Les managers peuvent voir toutes les feuilles
    if (userRole === 'MANAGER' || userRole === 'ADMIN') {
      return await this.timesheetsRepository.find({
        relations: ['user', 'entries', 'entries.category'],
        order: { weekStartDate: 'DESC' },
      });
    }

    // Les utilisateurs voient uniquement leurs feuilles
    return await this.timesheetsRepository.find({
      where: { userId },
      relations: ['entries', 'entries.category'],
      order: { weekStartDate: 'DESC' },
    });
  }

  async findByWeek(userId: string, weekStartDate: string, currentUser: User): Promise<Timesheet> {
    const date = new Date(weekStartDate);
    const monday = this.getMondayOfWeek(date);

    const timesheet = await this.timesheetsRepository.findOne({
      where: { userId, weekStartDate: monday },
      relations: ['user', 'entries', 'entries.category'],
    });

    // Si c'est un manager/admin, il peut voir toutes les feuilles
    if (timesheet && (currentUser.role === 'MANAGER' || currentUser.role === 'ADMIN')) {
      return timesheet;
    }

    // Sinon, vérifier que c'est la feuille de l'utilisateur connecté
    if (timesheet && timesheet.userId !== currentUser.id) {
      throw new ForbiddenException('Vous n\'avez pas accès à cette feuille de temps');
    }

    return timesheet;
  }

  async findOne(id: string, currentUser: User): Promise<Timesheet> {
    const timesheet = await this.timesheetsRepository.findOne({
      where: { id },
      relations: ['user', 'entries', 'entries.category'],
    });

    if (!timesheet) {
      throw new NotFoundException(`Feuille de temps avec l'ID ${id} non trouvée`);
    }

    // Les managers peuvent voir toutes les feuilles
    if (currentUser.role === 'MANAGER' || currentUser.role === 'ADMIN') {
      return timesheet;
    }

    // Les utilisateurs voient uniquement leurs feuilles
    if (timesheet.userId !== currentUser.id) {
      throw new ForbiddenException('Vous n\'avez pas accès à cette feuille de temps');
    }

    return timesheet;
  }

  async update(
    id: string,
    updateTimesheetDto: UpdateTimesheetDto,
    currentUser: User,
  ): Promise<Timesheet> {
    const timesheet = await this.findOne(id, currentUser);

    // Mettre à jour le statut si fourni
    if (updateTimesheetDto.status) {
      timesheet.status = updateTimesheetDto.status;
    }

    // Mettre à jour les entrées si fournies
    if (updateTimesheetDto.entries) {
      // Supprimer les anciennes entrées
      await this.entriesRepository.delete({ timesheetId: id });

      // Créer les nouvelles entrées
      const entries = updateTimesheetDto.entries.map((entryDto) => {
        const entry = this.entriesRepository.create({
          timesheetId: id,
          categoryId: entryDto.categoryId,
          subactivity: entryDto.subactivity,
          monday: entryDto.monday,
          tuesday: entryDto.tuesday,
          wednesday: entryDto.wednesday,
          thursday: entryDto.thursday,
          friday: entryDto.friday,
          total: this.calculateEntryTotal(entryDto),
        });
        return entry;
      });

      await this.entriesRepository.save(entries);
    }

    const updated = await this.findOne(id, currentUser);

    // Si le statut est SUBMITTED ou APPROVED, valider le total
    if (updated.status !== TimesheetStatus.DRAFT) {
      await this.validateTotalDays(updated.entries);
    }

    // Mettre à jour le total de la feuille
    const totalDays = this.calculateTotal(updated.entries);
    updated.totalDays = totalDays;
    await this.timesheetsRepository.save(updated);

    return updated;
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const timesheet = await this.findOne(id, currentUser);
    await this.timesheetsRepository.remove(timesheet);
  }

  async getAllByWeek(weekStartDate: string): Promise<Timesheet[]> {
    const date = new Date(weekStartDate);
    const monday = this.getMondayOfWeek(date);

    return await this.timesheetsRepository.find({
      where: { weekStartDate: monday },
      relations: ['user', 'entries', 'entries.category'],
    });
  }
}

