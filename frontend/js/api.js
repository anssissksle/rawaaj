const api = {
  getToken() {
    return localStorage.getItem('rawaaj_token');
  },

  setAuth(token, user) {
    localStorage.setItem('rawaaj_token', token);
    localStorage.setItem('rawaaj_user', JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem('rawaaj_token');
    localStorage.removeItem('rawaaj_user');
  },

  getUser() {
    const u = localStorage.getItem('rawaaj_user');
    return u ? JSON.parse(u) : null;
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'حدث خطأ');
      }

      return data;
    } catch (err) {
      if (err.name === 'TypeError') {
        throw new Error('تعذر الاتصال بالسيرفر. تأكد أن الـ Backend يعمل على المنفذ 3000');
      }
      throw err;
    }
  },

  // Auth
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  register(name, email, password, phone) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone })
    });
  },

  // Catalog
  getServices() {
    return this.request('/services');
  },

  getPackages() {
    return this.request('/packages');
  },

  // Orders (user)
  createOrder(type, itemId, notes) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify({ type, item_id: itemId, notes })
    });
  },

  getOrders() {
    return this.request('/orders');
  },

  // User
  getDashboard() {
    return this.request('/user/dashboard');
  },

  updateProfile(name, phone) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, phone })
    });
  },

  changePassword(currentPassword, newPassword) {
    return this.request('/user/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  getProjects() {
    return this.request('/user/projects');
  },

  // ===== Admin APIs =====
  adminDashboard() {
    return this.request('/admin/dashboard');
  },

  adminGetOrders() {
    return this.request('/admin/orders');
  },

  adminUpdateOrderStatus(orderId, status) {
    return this.request(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  adminGetUsers() {
    return this.request('/admin/users');
  }
};
