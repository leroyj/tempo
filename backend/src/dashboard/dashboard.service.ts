import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Timesheet, TimesheetStatus } from '../timesheets/entities/timesheet.entity';
import { MissingTimesheetDto } from './dto/missing-timesheet.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Timesheet)
    private timesheetsRepository: Repository<Timesheet>,
  ) {}

  async getMissingTimesheets(weekStartDate: string): Promise<MissingTimesheetDto[]> {
    const date = new Date(weekStartDate);
    const monday = this.getMondayOfWeek(date);

    // Récupérer tous les utilisateurs actifs
    const users = await this.usersRepository.find({
      where: { isActive: true },
      order: { lastName: 'ASC', firstName: 'ASC' },
    });

    // Récupérer toutes les feuilles pour cette semaine
    const timesheets = await this.timesheetsRepository.find({
      where: { weekStartDate: monday },
      relations: ['user'],
    });

    const timesheetMap = new Map(timesheets.map((ts) => [ts.userId, ts]));

    // Construire la liste avec le statut de chaque utilisateur
    const now = new Date();
    const isLate = monday < now; // Semaine passée

    return users.map((user) => {
      const timesheet = timesheetMap.get(user.id);

      return {
        userId: user.id,
        userEmail: user.email,
        userFirstName: user.firstName,
        userLastName: user.lastName,
        status: timesheet?.status || null,
        isLate: isLate && (!timesheet || timesheet.status !== TimesheetStatus.APPROVED),
        hasTimesheet: !!timesheet,
      };
    });
  }

  async sendReminder(userId: string, weekStartDate: string): Promise<{ success: boolean; message: string }> {
    // TODO: Implémenter l'envoi d'email réel
    // Pour l'instant, on simule juste la relance
    // Structure extensible : créer un service NotificationService qui peut être branché
    // sur un provider d'email (SendGrid, AWS SES, etc.)

    console.log(`[REMINDER] Envoi de relance à l'utilisateur ${userId} pour la semaine ${weekStartDate}`);

    return {
      success: true,
      message: `Relance envoyée à l'utilisateur ${userId} pour la semaine ${weekStartDate}`,
    };
  }

  private getMondayOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }
}

