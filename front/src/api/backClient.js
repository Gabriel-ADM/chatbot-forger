import axios from 'axios';

const baseURL =
  import.meta.env.VITE_BACK_AXIOS_BASE ||
  import.meta.env.VITE_API_BASE?.replace(/\/api\/?$/, '') ||
  'http://127.0.0.1:3000';

export const base44 = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

base44.auth = {
  getUser: async () => ({ id: '1', name: 'Admin', email: 'admin@local.com' }),
  me: async () => ({
    id: '1',
    name: 'Local',
    email: 'local@dev',
    role: 'admin',
  }),
  login: async () => {},
  logout: async () => {},
  redirectToLogin: async () => {},
};
