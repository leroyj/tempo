import axios from 'axios';

// URL de l'API : depuis le navigateur, toujours utiliser localhost (port exposé)
// Le proxy dans package.json gère la communication interne Docker
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3030';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tempo-auth-storage');
  if (token) {
    try {
      const parsed = JSON.parse(token);
      if (parsed.state?.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`;
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
  return config;
});

export default api;

