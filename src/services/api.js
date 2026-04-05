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
    login: (data) => api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    register: (data) => api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
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
  },
 
  //Felhasználó végpontok - helyes útvonalak
  user: {
    getProfile:      () => api.request('/users/me'),
    updateProfile:   (data) => api.request('/users/update', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
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
};
 
export default api;