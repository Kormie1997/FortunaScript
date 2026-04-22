const API_URL = '/api';

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');

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

  //Auth
  auth: {
    login:    (data) => api.request('/auth/login',    { method: 'POST', body: JSON.stringify(data) }),
    register: (data) => api.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },

  //Admin végpontok
  admin: {
    getStats:   () => api.request('/admin/stats'),
    getUsers:   () => api.request('/admin/users'),
    getTickets: () => api.request('/admin/tickets'),
    banUser:    (userId, isActive) => api.request(`/admin/users/${userId}/ban`, {
      method: 'PUT',
      body: JSON.stringify({ isActive })
    }),
    addBalance: (userId, amount) => api.request(`/admin/users/${userId}/add-balance`, {
      method: 'POST',
      body: JSON.stringify({ amount })
    }),
    toggleMaintenance: () => Promise.resolve(),
    toggleDrawLock: () => api.request('/admin/settings/draw-lock/toggle', { method: 'POST' }),
    getDrawLock:    () => api.request('/admin/settings/draw-lock'),
    backup:            () => Promise.resolve(),
  },

  //Sorsolás kezelés (DrawController)
  draws: {
    getAll: (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.gameType !== undefined) params.append('gameType', filters.gameType);
      if (filters.isDrawn  !== undefined) params.append('isDrawn',  filters.isDrawn);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
      const query = params.toString();
      return api.request(`/admin/draws${query ? '?' + query : ''}`);
    },

    getSummary: () => api.request('/admin/draws/summary'),

    getById: (id) => api.request(`/admin/draws/${id}`),

    getResults: (id) => api.request(`/admin/draws/${id}/results`),

    create: (data) => api.request('/admin/draws/create', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    toggleActive: (id) => api.request(`/admin/draws/${id}/toggle-active`, {
      method: 'PUT'
    }),

    execute: (id) => api.request(`/admin/draws/${id}/execute`, {
      method: 'POST'
    }),

    //Sorsolás törlése
    delete: (id) => api.request(`/admin/draws/${id}`, {
      method: 'DELETE'
    }),
  },

  //Felhasználó végpontok
  user: {
    getProfile:      () => api.request('/users/me'),
    updateProfile:   (data) => api.request('/users/update', { method: 'PUT', body: JSON.stringify(data) }),
    getTickets:      () => api.request('/tickets/my'),
    getTransactions: () => api.request('/transactions/my'),
  },

  //Szelvény vásárlás
  tickets: {
    purchase: (data) => api.request('/tickets/purchase', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  },

  //Egyenleg
  balance: {
    topup: (amount) => api.request('/balance/topup', {
      method: 'POST',
      body: JSON.stringify({ amount })
    }),
    adminTopup: (userId, amount) => api.request(`/balance/admin/topup/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ amount })
    }),
  },
};

export default api;