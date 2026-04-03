const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5168/api';

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token'); // JWT-hez később

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    const res = await fetch(`${API_URL}${endpoint}`, config);

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'API hiba történt');
    }

    return res.json();
  },

  // Admin végpontok
  admin: {
    getStats: () => api.request('/admin/stats'),
    getUsers: () => api.request('/admin/users'),
    banUser: (userId) => api.request(`/admin/users/${userId}/ban`, { method: 'POST' }),
    toggleMaintenance: () => api.request('/admin/maintenance', { method: 'POST' }),
    toggleDrawLock: () => api.request('/admin/draw-lock', { method: 'POST' }),
    backup: () => api.request('/admin/backup', { method: 'POST' }),
  },

  // Felhasználó végpontok
  user: {
    getProfile: () => api.request('/user/profile'),
    getTickets: () => api.request('/user/tickets'),
    getTransactions: () => api.request('/user/transactions'),
  },

  // Játékok és szelvények
  games: {
    getAll: () => api.request('/games'),
  },

  tickets: {
    submit: (ticketData) => api.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    }),
  },
};

export default api;