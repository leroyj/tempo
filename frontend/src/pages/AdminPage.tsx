import React, { useState } from 'react';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import './AdminPage.css';

const AdminPage: React.FC = () => {
  const { isAdmin } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'users' | 'categories' | 'holidays'>('users');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; errors: string[] } | null>(null);

  if (!isAdmin()) {
    return <div>Accès non autorisé</div>;
  }

  const handleFileUpload = async (endpoint: string, file: File) => {
    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadResult(response.data);
      alert(`Import réussi : ${response.data.success} enregistrements`);
    } catch (err: any) {
      alert('Erreur lors de l\'import : ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-page">
      <h2>Configuration</h2>

      <div className="admin-tabs">
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Utilisateurs
        </button>
        <button
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => setActiveTab('categories')}
        >
          Catégories
        </button>
        <button
          className={activeTab === 'holidays' ? 'active' : ''}
          onClick={() => setActiveTab('holidays')}
        >
          Jours fériés
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'users' && (
          <div className="admin-section">
            <h3>Import d'utilisateurs</h3>
            <p className="admin-info">
              Format CSV attendu : <code>email,firstname,lastname,role</code>
            </p>
            <div className="upload-section">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload('/users/import', file);
                  }
                }}
                disabled={uploading}
              />
              {uploading && <p>Import en cours...</p>}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="admin-section">
            <h3>Import de catégories</h3>
            <p className="admin-info">
              Format CSV attendu : <code>code,label,is_default,display_order</code>
            </p>
            <div className="upload-section">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload('/categories/import', file);
                  }
                }}
                disabled={uploading}
              />
              {uploading && <p>Import en cours...</p>}
            </div>
          </div>
        )}

        {activeTab === 'holidays' && (
          <div className="admin-section">
            <h3>Import de jours fériés</h3>
            <p className="admin-info">
              Format CSV attendu : <code>date,label,country</code>
            </p>
            <div className="upload-section">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload('/holidays/import', file);
                  }
                }}
                disabled={uploading}
              />
              {uploading && <p>Import en cours...</p>}
            </div>
          </div>
        )}

        {uploadResult && (
          <div className="upload-result">
            <p>Succès : {uploadResult.success}</p>
            {uploadResult.errors.length > 0 && (
              <div>
                <p>Erreurs :</p>
                <ul>
                  {uploadResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;

