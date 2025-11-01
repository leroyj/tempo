import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Timesheet } from '../timesheets/entities/timesheet.entity';
import { TimesheetEntry } from '../timesheets/entities/timesheet-entry.entity';

interface CsvRow {
  user_id: string;
  user_nom: string;
  semaine_iso: string;
  date_lundi_semaine: string;
  categorie_code: string;
  categorie_libelle: string;
  sous_activite: string;
  jour_lundi: number;
  jour_mardi: number;
  jour_mercredi: number;
  jour_jeudi: number;
  jour_vendredi: number;
  total_semaine: number;
  statut: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Timesheet)
    private timesheetsRepository: Repository<Timesheet>,
    @InjectRepository(TimesheetEntry)
    private entriesRepository: Repository<TimesheetEntry>,
  ) {}

  async exportTimesheets(from: Date, to: Date): Promise<string> {
    const timesheets = await this.timesheetsRepository.find({
      where: {
        weekStartDate: Between(from, to),
      },
      relations: ['user', 'entries', 'entries.category'],
      order: { weekStartDate: 'ASC', user: { lastName: 'ASC' } },
    });

    const rows: CsvRow[] = [];

    for (const timesheet of timesheets) {
      const weekIso = this.getWeekISO(timesheet.weekStartDate);

      for (const entry of timesheet.entries) {
        rows.push({
          user_id: timesheet.user.id,
          user_nom: `${timesheet.user.firstName} ${timesheet.user.lastName}`,
          semaine_iso: weekIso,
          date_lundi_semaine: timesheet.weekStartDate.toISOString().split('T')[0],
          categorie_code: entry.category.code,
          categorie_libelle: entry.category.label,
          sous_activite: entry.subactivity || '',
          jour_lundi: Number(entry.monday),
          jour_mardi: Number(entry.tuesday),
          jour_mercredi: Number(entry.wednesday),
          jour_jeudi: Number(entry.thursday),
          jour_vendredi: Number(entry.friday),
          total_semaine: Number(entry.total),
          statut: timesheet.status,
        });
      }
    }

    // Générer le CSV
    const headers = [
      'user_id',
      'user_nom',
      'semaine_iso',
      'date_lundi_semaine',
      'categorie_code',
      'categorie_libelle',
      'sous_activite',
      'jour_lundi',
      'jour_mardi',
      'jour_mercredi',
      'jour_jeudi',
      'jour_vendredi',
      'total_semaine',
      'statut',
    ];

    const csvRows = [headers.join(',')];

    for (const row of rows) {
      const values = [
        row.user_id,
        `"${row.user_nom}"`,
        row.semaine_iso,
        row.date_lundi_semaine,
        row.categorie_code,
        `"${row.categorie_libelle}"`,
        `"${row.sous_activite}"`,
        row.jour_lundi,
        row.jour_mardi,
        row.jour_mercredi,
        row.jour_jeudi,
        row.jour_vendredi,
        row.total_semaine,
        row.statut,
      ];
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  private getWeekISO(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return (
      d.getFullYear() +
      '-W' +
      String(1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)).padStart(2, '0')
    );
  }
}

