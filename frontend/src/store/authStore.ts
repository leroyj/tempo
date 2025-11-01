import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'MANAGER' | 'ADMIN';
  isActive: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  isManager: () => boolean;
  isAdmin: () => boolean;
}

const loadState = (): { user: User | null; token: string | null } => {
  try {
    const stored = localStorage.getItem('tempo-auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user || null,
        token: parsed.token || null,
      };
    }
  } catch (e) {
    // Ignore
  }
  return { user: null, token: null };
};

const saveState = (state: { user: User | null; token: string | null }) => {
  try {
    localStorage.setItem('tempo-auth-storage', JSON.stringify(state));
  } catch (e) {
    // Ignore
  }
};

const initialState = loadState();
if (initialState.token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialState.token}`;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: initialState.user,
  token: initialState.token,
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    const newState = {
      user: response.data.user,
      token: response.data.access_token,
    };
    set(newState);
    saveState(newState);
    // Configurer axios pour utiliser le token
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
  },
  logout: () => {
    set({ user: null, token: null });
    saveState({ user: null, token: null });
    delete axios.defaults.headers.common['Authorization'];
  },
  isAuthenticated: () => {
    return get().token !== null && get().user !== null;
  },
  isManager: () => {
    const user = get().user;
    return user?.role === 'MANAGER' || user?.role === 'ADMIN';
  },
  isAdmin: () => {
    return get().user?.role === 'ADMIN';
  },
}));

// Configurer axios par défaut
axios.defaults.headers.common['Content-Type'] = 'application/json';

