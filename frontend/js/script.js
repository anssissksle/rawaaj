document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  setupNavigation();
  setupModals();
  setupAuthUI();
  loadServices();
  loadPackages();
  setupAccountPages();
  setupForms();
}

/* ========== Navigation ========== */
function setupNavigation() {
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');

  mobileBtn?.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  // Close mobile menu on link click
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      navMenu.classList.remove('open');
      showMainContent();
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (scrollY >= top) current = section.getAttribute('id');
    });
    document.querySelectorAll('.nav-item').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ========== Modals ========== */
function setupModals() {
  document.getElementById('openLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('loginModal');
  });

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(btn.dataset.close);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  document.getElementById('switchToSignup')?.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal('loginModal');
    openModal('signupModal');
  });

  document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal('signupModal');
    openModal('loginModal');
  });
}

function openModal(id) {
  document.getElementById(id)?.classList.add('active');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
  // Clear errors
  document.querySelectorAll('.form-error').forEach(el => {
    el.style.display = 'none';
    el.textContent = '';
  });
}

/* ========== Auth UI ========== */
function setupAuthUI() {
  updateAuthUI();

  document.getElementById('accountBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openSidebar();
  });

  document.getElementById('closeSidebar')?.addEventListener('click', closeSidebar);
  document.getElementById('sidebarOverlay')?.addEventListener('click', closeSidebar);

  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    api.clearAuth();
    updateAuthUI();
    closeSidebar();
    showMainContent();
    showToast('تم تسجيل الخروج بنجاح', 'success');
  });
}

function updateAuthUI() {
  const isLoggedIn = api.isLoggedIn();
  const loginBtn = document.getElementById('openLogin');
  const accountBtn = document.getElementById('accountBtn');

  if (isLoggedIn && api.isAdmin()) {
    // أدمن: إخفاء واجهة الموقع وإظهار لوحة الإدارة فقط
    showAdminLayout();
    return;
  }

  // إخفاء لوحة الأدمن للمستخدم العادي
  hideAdminLayout();

  if (isLoggedIn) {
    loginBtn.style.display = 'none';
    accountBtn.style.display = 'inline-flex';

    const user = api.getUser();
    if (user) {
      document.getElementById('sidebarName').textContent = user.name;
      document.getElementById('sidebarEmail').textContent = user.email;
      document.getElementById('sidebarAvatar').textContent = user.name.charAt(0);
    }
  } else {
    loginBtn.style.display = 'inline-flex';
    accountBtn.style.display = 'none';
  }
}

function openSidebar() {
  document.getElementById('accountSidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('active');
}

function closeSidebar() {
  document.getElementById('accountSidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');
}

/* ========== Load Services ========== */
async function loadServices() {
  const container = document.getElementById('servicesContainer');
  try {
    const res = await api.getServices();
    container.innerHTML = res.data.map(s => `
      <div class="card">
        <div class="card-icon"><i class="fas ${s.icon}"></i></div>
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        <div class="card-price">${s.price} <span>ج.م</span></div>
        <button class="btn btn-primary" onclick="orderItem('service', ${s.id}, '${s.title}')">
          <i class="fas fa-cart-plus"></i> اطلب الآن
        </button>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>${err.message}</p></div>`;
  }
}

/* ========== Load Packages ========== */
async function loadPackages() {
  const container = document.getElementById('packagesContainer');
  try {
    const res = await api.getPackages();
    container.innerHTML = res.data.map(p => `
      <div class="card package-card ${p.is_popular ? 'popular' : ''}">
        ${p.is_popular ? '<div class="popular-badge">الأكثر طلباً</div>' : ''}
        <h3>${p.name}</h3>
        <p>${p.description || ''}</p>
        <div class="card-price">${p.price} <span>ج.م / شهرياً</span></div>
        <ul class="package-features">
          ${p.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
        </ul>
        <button class="btn btn-primary" onclick="orderItem('package', ${p.id}, '${p.name}')">
          <i class="fas fa-crown"></i> اشترك الآن
        </button>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>${err.message}</p></div>`;
  }
}

/* ========== Order ========== */
async function orderItem(type, id, name) {
  if (!api.isLoggedIn()) {
    showToast('يجب تسجيل الدخول أولاً لطلب الخدمة', 'error');
    openModal('loginModal');
    return;
  }

  // الأدمن لا يطلب خدمات كعميل
  if (api.isAdmin()) {
    showToast('حساب الإدارة لا يمكنه طلب خدمات. استخدم حساب عميل.', 'error');
    return;
  }

  try {
    const res = await api.createOrder(type, id);
    showToast(`تم طلب "${name}" بنجاح!`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ========== Account Pages ========== */
function setupAccountPages() {
  document.querySelectorAll('.sidebar-link[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      showAccountPage(page);
      closeSidebar();

      // Update active
      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

function showMainContent() {
  document.getElementById('mainContent').style.display = 'block';
  document.querySelectorAll('.account-page').forEach(p => p.classList.remove('active'));
}

function showAccountPage(page) {
  document.getElementById('mainContent').style.display = 'none';
  document.querySelectorAll('.account-page').forEach(p => p.classList.remove('active'));

  const pageEl = document.getElementById(`${page}Page`);
  if (pageEl) {
    pageEl.classList.add('active');

    if (page === 'dashboard') loadDashboard();
    if (page === 'orders') loadOrders();
    if (page === 'projects') loadProjects();
    if (page === 'settings') loadSettings();
  }
}

async function loadDashboard() {
  try {
    const res = await api.getDashboard();
    const { stats, recentOrders } = res.data;

    document.getElementById('dashboardStats').innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${stats.totalOrders}</div>
        <div class="stat-label">إجمالي الطلبات</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.pendingOrders}</div>
        <div class="stat-label">قيد الانتظار</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.inProgressOrders}</div>
        <div class="stat-label">جاري التنفيذ</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.completedOrders}</div>
        <div class="stat-label">مكتملة</div>
      </div>
    `;

    const tbody = document.getElementById('recentOrdersTable');
    if (recentOrders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#aaa;">لا توجد طلبات بعد</td></tr>`;
    } else {
      tbody.innerHTML = recentOrders.map(o => `
        <tr>
          <td>#${o.id}</td>
          <td>${o.item_name}</td>
          <td>${o.price} ج.م</td>
          <td><span class="status-badge status-${o.status}">${STATUS_LABELS[o.status] || o.status}</span></td>
          <td>${formatDate(o.created_at)}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadOrders() {
  try {
    const res = await api.getOrders();
    const tbody = document.getElementById('ordersTable');

    if (res.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#aaa;">لا توجد طلبات بعد</td></tr>`;
    } else {
      tbody.innerHTML = res.data.map(o => `
        <tr>
          <td>#${o.id}</td>
          <td>${TYPE_LABELS[o.type] || o.type}</td>
          <td>${o.item_name}</td>
          <td>${o.price} ج.م</td>
          <td><span class="status-badge status-${o.status}">${STATUS_LABELS[o.status] || o.status}</span></td>
          <td>${formatDate(o.created_at)}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadProjects() {
  const container = document.getElementById('projectsContainer');
  try {
    const res = await api.getProjects();
    if (res.data.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-folder-open"></i>
          <p>لا توجد مشاريع بعد. اطلب خدمة أو باقة للبدء!</p>
        </div>
      `;
    } else {
      container.innerHTML = `<div class="cards-grid">${res.data.map(p => `
        <div class="card">
          <h3>${p.title}</h3>
          <p>${p.description || 'لا يوجد وصف'}</p>
          <span class="status-badge status-${p.status === 'active' ? 'in_progress' : p.status}">${p.status}</span>
        </div>
      `).join('')}</div>`;
    }
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
  }
}

function loadSettings() {
  const user = api.getUser();
  if (user) {
    document.getElementById('settingsName').value = user.name || '';
    document.getElementById('settingsEmail').value = user.email || '';
    document.getElementById('settingsPhone').value = user.phone || '';
  }
}

/* ========== Forms ========== */
function setupForms() {
  // Login
  document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    try {
      const res = await api.login(email, password);
      api.setAuth(res.token, res.user);
      closeModal('loginModal');
      document.getElementById('loginForm').reset();

      if (res.user.role === 'admin') {
        showToast('مرحباً بك في لوحة الإدارة', 'success');
        showAdminLayout();
      } else {
        updateAuthUI();
        showToast('مرحباً بك! تم تسجيل الدخول بنجاح', 'success');
      }
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
  });

  // Signup
  document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const password = document.getElementById('signupPassword').value;
    const errorEl = document.getElementById('signupError');

    try {
      const res = await api.register(name, email, password, phone);
      api.setAuth(res.token, res.user);
      updateAuthUI();
      closeModal('signupModal');
      showToast('تم إنشاء حسابك بنجاح! مرحباً بك', 'success');
      document.getElementById('signupForm').reset();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
  });

  // Profile
  document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('settingsName').value.trim();
    const phone = document.getElementById('settingsPhone').value.trim();

    try {
      const res = await api.updateProfile(name, phone);
      api.setAuth(api.getToken(), res.user);
      updateAuthUI();
      showToast('تم تحديث البيانات بنجاح', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Password
  document.getElementById('passwordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    try {
      await api.changePassword(currentPassword, newPassword);
      showToast('تم تغيير كلمة المرور بنجاح', 'success');
      document.getElementById('passwordForm').reset();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

/* ========== Helpers ========== */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toastMessage');
  msg.textContent = message;
  toast.className = `toast ${type} show`;

  const icon = toast.querySelector('i');
  icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';

  setTimeout(() => toast.classList.remove('show'), 3500);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Make orderItem available globally
window.orderItem = orderItem;

/* ========== Admin Layout (منفصل تماماً) ========== */

function showAdminLayout() {
  if (!api.isAdmin()) {
    showToast('غير مصرح لك بالوصول', 'error');
    hideAdminLayout();
    api.clearAuth();
    updateAuthUI();
    return;
  }

  // إخفاء الموقع العادي بالكامل
  const main = document.getElementById('mainContent');
  const header = document.querySelector('.header');
  const lights = document.getElementById('floatingLights');
  if (main) main.style.display = 'none';
  if (header) header.style.display = 'none';
  if (lights) lights.style.display = 'none';
  document.querySelectorAll('.account-page').forEach(p => p.classList.remove('active'));
  closeSidebar();

  // إظهار لوحة الأدمن
  const layout = document.getElementById('adminLayout');
  if (layout) layout.style.display = 'block';

  const user = api.getUser();
  if (user) {
    document.getElementById('adminName').textContent = user.name;
    document.getElementById('adminEmail').textContent = user.email;
    document.getElementById('adminAvatar').textContent = user.name.charAt(0);
  }

  setupAdminNav();
  switchAdminTab('dashboard');
}

function hideAdminLayout() {
  const layout = document.getElementById('adminLayout');
  if (layout) layout.style.display = 'none';

  const main = document.getElementById('mainContent');
  const header = document.querySelector('.header');
  const lights = document.getElementById('floatingLights');
  if (main) main.style.display = 'block';
  if (header) header.style.display = 'flex';
  if (lights) lights.style.display = 'block';
}

function setupAdminNav() {
  document.querySelectorAll('.admin-nav-link').forEach(link => {
    link.onclick = (e) => {
      e.preventDefault();
      const tab = link.dataset.adminTab;
      switchAdminTab(tab);
    };
  });

  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      api.clearAuth();
      hideAdminLayout();
      updateAuthUI();
      showMainContent();
      showToast('تم تسجيل الخروج من لوحة الإدارة', 'success');
    };
  }
}

function switchAdminTab(tab) {
  if (!api.isAdmin()) {
    showToast('غير مصرح', 'error');
    hideAdminLayout();
    return;
  }

  document.querySelectorAll('.admin-nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.adminTab === tab);
  });
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));

  const titles = {
    dashboard: 'الإحصائيات',
    orders: 'إدارة الطلبات',
    users: 'العملاء'
  };
  document.getElementById('adminPageTitle').textContent = titles[tab] || '';

  if (tab === 'dashboard') {
    document.getElementById('adminTabDashboard').classList.add('active');
    loadAdminDashboard();
  } else if (tab === 'orders') {
    document.getElementById('adminTabOrders').classList.add('active');
    loadAdminOrders();
  } else if (tab === 'users') {
    document.getElementById('adminTabUsers').classList.add('active');
    loadAdminUsers();
  }
}

async function loadAdminDashboard() {
  try {
    const res = await api.adminDashboard();
    const { stats, recentOrders } = res.data;

    document.getElementById('adminStats').innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${stats.totalOrders}</div>
        <div class="stat-label">إجمالي الطلبات</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.pendingOrders}</div>
        <div class="stat-label">قيد الانتظار</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.inProgressOrders}</div>
        <div class="stat-label">جاري التنفيذ</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.completedOrders}</div>
        <div class="stat-label">مكتملة</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalUsers}</div>
        <div class="stat-label">العملاء</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalRevenue}</div>
        <div class="stat-label">الإيرادات (ج.م)</div>
      </div>
    `;

    const tbody = document.getElementById('adminRecentOrders');
    if (!recentOrders || recentOrders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#aaa;">لا توجد طلبات بعد</td></tr>`;
    } else {
      tbody.innerHTML = recentOrders.map(o => `
        <tr>
          <td>#${o.id}</td>
          <td>${o.user_name}</td>
          <td>${o.item_name}</td>
          <td>${o.price} ج.م</td>
          <td><span class="status-badge status-${o.status}">${STATUS_LABELS[o.status] || o.status}</span></td>
          <td>${formatDate(o.created_at)}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    showToast(err.message, 'error');
    if (err.message.includes('غير مصرح') || err.message.includes('تسجيل الدخول')) {
      api.clearAuth();
      hideAdminLayout();
      updateAuthUI();
    }
  }
}

async function loadAdminOrders() {
  try {
    const res = await api.adminGetOrders();
    const tbody = document.getElementById('adminOrdersTable');

    if (res.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:#aaa;">لا توجد طلبات بعد</td></tr>`;
      return;
    }

    tbody.innerHTML = res.data.map(o => `
      <tr>
        <td>#${o.id}</td>
        <td>${o.user_name}</td>
        <td>${o.user_email}</td>
        <td>${o.user_phone || '-'}</td>
        <td>${o.item_name}</td>
        <td>${o.price} ج.م</td>
        <td><span class="status-badge status-${o.status}">${STATUS_LABELS[o.status] || o.status}</span></td>
        <td>${formatDate(o.created_at)}</td>
        <td>
          <select class="status-select" onchange="changeOrderStatus(${o.id}, this.value)">
            <option value="pending" ${o.status==='pending'?'selected':''}>قيد الانتظار</option>
            <option value="in_progress" ${o.status==='in_progress'?'selected':''}>جاري التنفيذ</option>
            <option value="review" ${o.status==='review'?'selected':''}>قيد المراجعة</option>
            <option value="completed" ${o.status==='completed'?'selected':''}>مكتمل</option>
            <option value="cancelled" ${o.status==='cancelled'?'selected':''}>ملغي</option>
          </select>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function changeOrderStatus(orderId, status) {
  try {
    await api.adminUpdateOrderStatus(orderId, status);
    showToast('تم تحديث حالة الطلب بنجاح', 'success');
    // تحديث التبويب الحالي
    const active = document.querySelector('.admin-nav-link.active');
    if (active) switchAdminTab(active.dataset.adminTab);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadAdminUsers() {
  try {
    const res = await api.adminGetUsers();
    const tbody = document.getElementById('adminUsersTable');

    if (res.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#aaa;">لا يوجد عملاء بعد</td></tr>`;
      return;
    }

    tbody.innerHTML = res.data.map(u => `
      <tr>
        <td>#${u.id}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.phone || '-'}</td>
        <td>${formatDate(u.created_at)}</td>
      </tr>
    `).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

window.changeOrderStatus = changeOrderStatus;
window.orderItem = orderItem;
