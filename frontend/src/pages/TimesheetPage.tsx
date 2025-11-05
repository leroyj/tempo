import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import './TimesheetPage.css';

interface Category {
  id: string;
  code: string;
  label: string;
  children?: Category[];
}

interface TimesheetEntry {
  id?: string;
  categoryId: string;
  subactivity?: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  total: number;
}

interface Timesheet {
  id?: string;
  userId: string;
  weekStartDate: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
  totalDays: number;
  entries: TimesheetEntry[];
}

const TimesheetPage: React.FC = () => {
  const { user } = useAuthStore();
  const [currentWeek, setCurrentWeek] = useState<Date>(() => {
    const today = new Date();
    const monday = new Date(today);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    return monday;
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const getMondayOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const formatWeekStart = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getWeekLabel = (date: Date): string => {
    const monday = getMondayOfWeek(date);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    return `Semaine du ${monday.toLocaleDateString('fr-FR')} au ${friday.toLocaleDateString('fr-FR')}`;
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories?forUser=true');
      setCategories(response.data);
    } catch (err: any) {
      setError('Erreur lors du chargement des catégories');
    }
  };

  const loadTimesheet = async () => {
    setLoading(true);
    setError('');
    try {
      const weekStart = formatWeekStart(currentWeek);
      const response = await api.get(`/timesheets/week?weekStartDate=${weekStart}`);
      // Normaliser les valeurs reçues (string "0.25" -> number 0.25, gérer virgule)
      const normalize = (v: any) => {
        if (v === null || v === undefined || v === '') return 0;
        if (typeof v === 'number') return v;
        if (typeof v === 'string') return parseFloat(v.replace(',', '.')) || 0;
        return Number(v) || 0;
      };

      const tsData: any = response.data;
      if (tsData?.entries && Array.isArray(tsData.entries)) {
        tsData.entries = tsData.entries.map((e: any) => ({
          ...e,
          monday: normalize(e.monday),
          tuesday: normalize(e.tuesday),
          wednesday: normalize(e.wednesday),
          thursday: normalize(e.thursday),
          friday: normalize(e.friday),
          total: normalize(e.total),
        }));
        tsData.totalDays = tsData.entries.reduce((sum: number, en: any) => sum + Number(en.total || 0), 0);
      }
      setTimesheet(tsData);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setTimesheet(null);
      } else {
        setError('Erreur lors du chargement de la feuille de temps');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTimesheet();
  }, [currentWeek]);

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(getMondayOfWeek(newWeek));
  };

  const handleEntryChange = (
    categoryId: string,
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday',
    value: string | number
  ) => {
    // Construire un timesheet "updated" en mémoire (ne pas se fier à setState précédent)
    const updated: Timesheet = timesheet
      ? { ...timesheet }
      : {
          userId: user!.id,
          weekStartDate: formatWeekStart(currentWeek),
          status: 'DRAFT',
          totalDays: 0,
          entries: [],
        };
    if (!updated.entries) {
      updated.entries = [];
    }

    let entry = updated.entries.find((e) => e.categoryId === categoryId);

    if (!entry) {
      entry = {
        categoryId,
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        total: 0,
      };
      updated.entries.push(entry);
    }

    // Conversion de la valeur en nombre
    const numValue = typeof value === 'string' 
      ? parseFloat(value.replace(',', '.')) 
      : value;
    
    entry[day] = isNaN(numValue) ? 0 : numValue;
    entry.total = Number(entry.monday) + Number(entry.tuesday) + Number(entry.wednesday) + Number(entry.thursday) + Number(entry.friday);

    const totalDays = updated.entries.reduce((sum, e) => sum + Number(e.total), 0);
    updated.totalDays = totalDays;

    setTimesheet(updated);
  };

  const handleSave = async (status: 'DRAFT' | 'SUBMITTED' = 'DRAFT') => {
    if (!timesheet || timesheet.entries.length === 0) {
      setError('Aucune donnée à enregistrer');
      return;
    }

    const totalDays = timesheet.entries.reduce((sum, e) => sum + e.total, 0);
    if (status === 'SUBMITTED' && Math.abs(totalDays - 5) > 0.01) {
      setError(`Le total doit être exactement 5 jours. Total actuel : ${totalDays.toFixed(2)}`);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        weekStartDate: formatWeekStart(currentWeek),
        status,
        entries: timesheet.entries.map((e) => ({
          categoryId: e.categoryId,
          subactivity: e.subactivity || '',
          monday: e.monday,
          tuesday: e.tuesday,
          wednesday: e.wednesday,
          thursday: e.thursday,
          friday: e.friday,
        })),
      };

      if (timesheet.id) {
        await api.patch(`/timesheets/${timesheet.id}`, payload);
      } else {
        await api.post('/timesheets', payload);
      }

      await loadTimesheet();
      setError('');
      alert(status === 'SUBMITTED' ? 'Feuille de temps validée avec succès' : 'Feuille de temps enregistrée');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const getEntryValue = (categoryId: string, day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'): number => {
    if (!timesheet?.entries) return 0;
    const entry = timesheet.entries.find((e) => e.categoryId === categoryId);
    if (!entry) return 0;
    const raw = entry[day];
    if (typeof raw === 'number') return raw;
    if (raw === null || raw === undefined || raw === '') return 0;
    return parseFloat(String(raw).replace(',', '.')) || 0;
  };

  const getTotalForDay = (day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'): number => {
    if (!timesheet || !timesheet.entries) return 0;
    return timesheet.entries.reduce((sum, e) => sum + Number(e[day] ?? 0), 0);
  };

  const totalDays = timesheet ? timesheet.totalDays : 0;
  const isValid = Math.abs(totalDays - 5) < 0.01;

  if (loading && !timesheet) {
    return <div className="timesheet-loading">Chargement...</div>;
  }

  return (
    <div className="timesheet-page">
      <div className="timesheet-header">
        <h2>{getWeekLabel(currentWeek)}</h2>
        <div className="week-navigation">
          <button onClick={() => handleWeekChange('prev')}>← Semaine précédente</button>
          <button onClick={() => handleWeekChange('next')}>Semaine suivante →</button>
        </div>
      </div>

      {error && <div className="timesheet-error">{error}</div>}

      {timesheet && timesheet.status === 'APPROVED' && (
        <div className="timesheet-status approved">✓ Feuille de temps validée</div>
      )}

      <div className="timesheet-controls">
        <button
          onClick={() => handleSave('DRAFT')}
          disabled={saving}
          className="btn-secondary"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <button
          onClick={() => handleSave('SUBMITTED')}
          disabled={saving || !isValid || timesheet?.status === 'APPROVED'}
          className="btn-primary"
        >
          Valider
        </button>
      </div>

      <div className="timesheet-grid-container">
        <table className="timesheet-grid">
          <thead>
            <tr>
              <th>Catégorie</th>
              <th>Lundi</th>
              <th>Mardi</th>
              <th>Mercredi</th>
              <th>Jeudi</th>
              <th>Vendredi</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {categories
              .filter((cat) => !cat.children || cat.children.length === 0)
              .map((category) => (
                <tr key={category.id}>
                  <td className="category-cell">
                    <strong>{category.label}</strong>
                  </td>
                  {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).map((day) => (
                    <td key={day}>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.25"
                        value={getEntryValue(category.id, day)}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleEntryChange(category.id, day, value);
                        }}
                        onBlur={(e) => {
                          // Force la conversion en nombre lors de la perte de focus
                          const value = parseFloat(e.target.value.replace(',', '.')) || 0;
                          handleEntryChange(category.id, day, value);
                        }}
                        disabled={timesheet?.status === 'APPROVED'}
                        className="day-input"
                      />
                    </td>
                  ))}
              <td className="total-cell">
                {timesheet?.entries 
                  ? (() => {
                      const entry = timesheet.entries.find((e) => e.categoryId === category.id);
                      const total = entry ? Number(entry.total) : 0;
                      return total.toFixed(2);
                    })()
                  : '0.00'
                }
                </td>
                 </tr>
              ))}
            <tr className="totals-row">
              <td><strong>Total</strong></td>
              {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).map((day) => (
                <td key={day} className={getTotalForDay(day) > 1 ? 'warning' : ''}>
                  <strong>{getTotalForDay(day).toFixed(2)}</strong>
                </td>
              ))}
              <td className={`total-cell ${!isValid ? 'error' : ''}`}>
                <strong>{totalDays.toFixed(2)} / 5.00</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {!isValid && (
        <div className="timesheet-warning">
          ⚠ Le total de la semaine doit être exactement 5 jours pour pouvoir valider.
        </div>
      )}
    </div>
  );
};

export default TimesheetPage;

