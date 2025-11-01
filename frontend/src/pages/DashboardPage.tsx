import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import './DashboardPage.css';

interface MissingTimesheet {
  userId: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | null;
  isLate: boolean;
  hasTimesheet: boolean;
}

const DashboardPage: React.FC = () => {
  const { isManager } = useAuthStore();
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState<Date>(() => {
    const today = new Date();
    const monday = new Date(today);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    return monday;
  });

  const [missingTimesheets, setMissingTimesheets] = useState<MissingTimesheet[]>([]);
  const [loading, setLoading] = useState(false);

  const formatWeekStart = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getMondayOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getWeekLabel = (date: Date): string => {
    const monday = getMondayOfWeek(date);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    return `Semaine du ${monday.toLocaleDateString('fr-FR')} au ${friday.toLocaleDateString('fr-FR')}`;
  };

  const loadMissingTimesheets = async () => {
    setLoading(true);
    try {
      const weekStart = formatWeekStart(currentWeek);
      const response = await api.get(`/dashboard/missing-timesheets?weekStartDate=${weekStart}`);
      setMissingTimesheets(response.data);
    } catch (err: any) {
      console.error('Erreur lors du chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isManager()) {
      loadMissingTimesheets();
    }
  }, [currentWeek]);

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(getMondayOfWeek(newWeek));
  };

  const handleRemind = async (userId: string) => {
    try {
      await api.post('/dashboard/remind', {
        userId,
        weekStartDate: formatWeekStart(currentWeek),
      });
      alert('Relance envoyée');
    } catch (err: any) {
      alert('Erreur lors de l\'envoi de la relance');
    }
  };

  const handleOpenTimesheet = (userId: string) => {
    // Naviguer vers la page de saisie avec l'ID utilisateur
    navigate(`/timesheet?userId=${userId}&weekStartDate=${formatWeekStart(currentWeek)}`);
  };

  const getStatusBadge = (status: MissingTimesheet['status'], isLate: boolean, hasTimesheet: boolean) => {
    if (!hasTimesheet) {
      return <span className="badge missing">Manquante</span>;
    }
    if (status === 'APPROVED') {
      return <span className="badge approved">Validée</span>;
    }
    if (status === 'SUBMITTED') {
      return <span className="badge submitted">Soumise</span>;
    }
    if (status === 'DRAFT') {
      return <span className="badge draft">Brouillon</span>;
    }
    return <span className="badge missing">-</span>;
  };

  if (!isManager()) {
    return <div>Accès non autorisé</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h2>Tableau de bord - {getWeekLabel(currentWeek)}</h2>
        <div className="week-navigation">
          <button onClick={() => handleWeekChange('prev')}>← Semaine précédente</button>
          <button onClick={() => handleWeekChange('next')}>Semaine suivante →</button>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading">Chargement...</div>
      ) : (
        <div className="dashboard-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {missingTimesheets.map((item) => (
                <tr key={item.userId} className={item.isLate ? 'late' : ''}>
                  <td>
                    {item.userFirstName} {item.userLastName}
                  </td>
                  <td>{item.userEmail}</td>
                  <td>{getStatusBadge(item.status, item.isLate, item.hasTimesheet)}</td>
                  <td>
                    <div className="dashboard-actions">
                      <button
                        onClick={() => handleOpenTimesheet(item.userId)}
                        className="btn-small"
                      >
                        Ouvrir
                      </button>
                      {item.isLate && (
                        <button
                          onClick={() => handleRemind(item.userId)}
                          className="btn-small btn-warning"
                        >
                          Relancer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

