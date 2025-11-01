import React, { useState } from 'react';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import './ExportPage.css';

const ExportPage: React.FC = () => {
  const { isManager } = useAuthStore();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [exporting, setExporting] = useState(false);

  if (!isManager()) {
    return <div>Accès non autorisé</div>;
  }

  const handleExport = async () => {
    if (!fromDate || !toDate) {
      alert('Veuillez sélectionner une période');
      return;
    }

    setExporting(true);
    try {
      const response = await api.get('/reports/timesheets', {
        params: { from: fromDate, to: toDate },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `timesheets_${fromDate}_${toDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      alert('Export réussi');
    } catch (err: any) {
      alert('Erreur lors de l\'export : ' + (err.response?.data?.message || err.message));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-page">
      <h2>Export CSV des feuilles de temps</h2>

      <div className="export-form">
        <div className="form-group">
          <label htmlFor="fromDate">Date de début</label>
          <input
            type="date"
            id="fromDate"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="toDate">Date de fin</label>
          <input
            type="date"
            id="toDate"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || !fromDate || !toDate}
          className="btn-primary"
        >
          {exporting ? 'Export en cours...' : 'Exporter CSV'}
        </button>
      </div>

      <div className="export-info">
        <p>L'export inclut toutes les feuilles de temps pour la période sélectionnée.</p>
        <p>Format : user_id, user_nom, semaine_iso, date_lundi_semaine, categorie_code, categorie_libelle, sous_activite, jour_lundi, jour_mardi, jour_mercredi, jour_jeudi, jour_vendredi, total_semaine, statut</p>
      </div>
    </div>
  );
};

export default ExportPage;

