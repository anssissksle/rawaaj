const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

const defaultData = {
  users: [],
  services: [
    { id: 1, title: 'كتابة مقال احترافي', description: 'مقال مدروس ومنسق باستخدام الذكاء الاصطناعي يعكس هوية مشروعك (حتى 800 كلمة)', price: 250, icon: 'fa-edit', category: 'content', is_active: 1 },
    { id: 2, title: 'تصميم منشور إنستجرام', description: 'تصميم جذاب ومتوافق مع هوية علامتك التجارية لمنصة إنستجرام', price: 150, icon: 'fa-instagram', category: 'design', is_active: 1 },
    { id: 3, title: 'تصميم ستوري', description: 'تصميم ستوري احترافي مع حركة خفيفة وجاهز للنشر', price: 120, icon: 'fa-mobile-alt', category: 'design', is_active: 1 },
    { id: 4, title: 'كتابة وصف منتج', description: 'وصف تسويقي مقنع لمنتجك يحفز على الشراء', price: 100, icon: 'fa-tag', category: 'content', is_active: 1 },
    { id: 5, title: 'تصميم بانر إعلاني', description: 'بانر إعلاني احترافي لمواقع التواصل أو الإعلانات المدفوعة', price: 200, icon: 'fa-ad', category: 'design', is_active: 1 },
    { id: 6, title: 'كتابة محتوى تيك توك', description: 'نص سيناريو قصير وجذاب لفيديوهات تيك توك', price: 180, icon: 'fa-video', category: 'content', is_active: 1 },
    { id: 7, title: 'كتابة بوست فيسبوك', description: 'منشور تسويقي جذاب لمنصة فيسبوك مع هاشتاجات مناسبة', price: 90, icon: 'fa-facebook', category: 'content', is_active: 1 },
    { id: 8, title: 'تصميم كوفر فيسبوك', description: 'غلاف فيسبوك احترافي يعكس هوية مشروعك', price: 170, icon: 'fa-image', category: 'design', is_active: 1 }
  ],
  packages: [
    {
      id: 1, name: 'الباقة الأساسية', price: 799,
      description: 'مناسبة لأصحاب المشاريع في البداية',
      features: ['4 مقالات احترافية شهرياً', '8 تصاميم منشورات إنستجرام', '4 ستوريز', 'مراجعة واحدة مرة لكل محتوى', 'تسليم خلال 5 أيام عمل'],
      is_popular: 0, is_active: 1
    },
    {
      id: 2, name: 'الباقة المتوسطة', price: 1499,
      description: 'الأكثر طلباً لأصحاب المشاريع النامية',
      features: ['8 مقالات احترافية شهرياً', '16 تصميم منشور إنستجرام', '8 ستوريز', '4 سيناريوهات تيك توك', 'مراجعتين لكل محتوى', 'تسليم خلال 3 أيام عمل', 'دعم فني أولوية'],
      is_popular: 1, is_active: 1
    },
    {
      id: 3, name: 'الباقة الاحترافية', price: 2799,
      description: 'للمشاريع اللي محتاجة محتوى كثيف واحترافي',
      features: ['15 مقال احترافي شهرياً', '30 تصميم منشور', '15 ستوري', '8 سيناريوهات تيك توك', '4 بانرات إعلانية', 'مراجعات غير محدودة', 'تسليم خلال 48 ساعة', 'مدير حساب مخصص', 'تقرير أداء شهري'],
      is_popular: 0, is_active: 1
    }
  ],
  orders: [],
  projects: [],
  counters: { users: 2, orders: 0, projects: 0 }
};

function load() {
  if (!fs.existsSync(DB_PATH)) {
    const bcrypt = require('bcryptjs');
    const hashed = bcrypt.hashSync('123456', 10);
    const adminHashed = bcrypt.hashSync('admin123', 10);

    // مستخدم عادي تجريبي
    defaultData.users.push({
      id: 1,
      name: 'محمد أحمد',
      email: 'demo@rawaaj.com',
      password: hashed,
      phone: '01012345678',
      role: 'user',
      created_at: new Date().toISOString()
    });

    // حساب الأدمن
    defaultData.users.push({
      id: 2,
      name: 'مدير النظام',
      email: 'admin@rawaaj.com',
      password: adminHashed,
      phone: '01000000000',
      role: 'admin',
      created_at: new Date().toISOString()
    });

    save(defaultData);
    return defaultData;
  }

  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

  // ترقية البيانات القديمة لو مفيش role
  let changed = false;
  data.users.forEach(u => {
    if (!u.role) {
      u.role = u.email === 'admin@rawaaj.com' ? 'admin' : 'user';
      changed = true;
    }
  });

  // لو مفيش أدمن، أضفه
  if (!data.users.find(u => u.role === 'admin')) {
    const bcrypt = require('bcryptjs');
    data.counters.users = (data.counters.users || data.users.length) + 1;
    data.users.push({
      id: data.counters.users,
      name: 'مدير النظام',
      email: 'admin@rawaaj.com',
      password: bcrypt.hashSync('admin123', 10),
      phone: '01000000000',
      role: 'admin',
      created_at: new Date().toISOString()
    });
    changed = true;
  }

  if (changed) save(data);
  return data;
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function getDb() {
  return {
    data: load(),
    save() {
      save(this.data);
    },

    findUserByEmail(email) {
      return this.data.users.find(u => u.email === email);
    },

    findUserById(id) {
      return this.data.users.find(u => u.id === id);
    },

    createUser({ name, email, password, phone, role }) {
      this.data.counters.users += 1;
      const user = {
        id: this.data.counters.users,
        name,
        email,
        password,
        phone: phone || null,
        role: role || 'user',
        created_at: new Date().toISOString()
      };
      this.data.users.push(user);
      this.save();
      return user;
    },

    updateUser(id, fields) {
      const user = this.findUserById(id);
      if (!user) return null;
      Object.assign(user, fields);
      this.save();
      return user;
    },

    getAllUsers() {
      return this.data.users.map(u => ({
        id: u.id, name: u.name, email: u.email,
        phone: u.phone, role: u.role, created_at: u.created_at
      }));
    },

    getServices() {
      return this.data.services.filter(s => s.is_active);
    },

    getService(id) {
      return this.data.services.find(s => s.id === Number(id) && s.is_active);
    },

    getPackages() {
      return this.data.packages.filter(p => p.is_active).map(p => ({
        ...p, is_popular: !!p.is_popular
      }));
    },

    getPackage(id) {
      const p = this.data.packages.find(p => p.id === Number(id) && p.is_active);
      if (!p) return null;
      return { ...p, is_popular: !!p.is_popular };
    },

    createOrder({ user_id, type, item_id, item_name, price, notes }) {
      this.data.counters.orders += 1;
      const order = {
        id: this.data.counters.orders,
        user_id,
        type,
        item_id,
        item_name,
        price,
        status: 'pending',
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.orders.push(order);
      this.save();
      return order;
    },

    getOrdersByUser(userId) {
      return this.data.orders
        .filter(o => o.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },

    getOrder(id, userId) {
      return this.data.orders.find(o => o.id === Number(id) && o.user_id === userId);
    },

    // ===== Admin methods =====
    getAllOrders() {
      return this.data.orders
        .map(o => {
          const user = this.findUserById(o.user_id);
          return {
            ...o,
            user_name: user ? user.name : 'غير معروف',
            user_email: user ? user.email : '-',
            user_phone: user ? user.phone : '-'
          };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },

    getOrderById(id) {
      const o = this.data.orders.find(o => o.id === Number(id));
      if (!o) return null;
      const user = this.findUserById(o.user_id);
      return {
        ...o,
        user_name: user ? user.name : 'غير معروف',
        user_email: user ? user.email : '-',
        user_phone: user ? user.phone : '-'
      };
    },

    updateOrderStatus(id, status) {
      const order = this.data.orders.find(o => o.id === Number(id));
      if (!order) return null;
      order.status = status;
      order.updated_at = new Date().toISOString();
      this.save();
      return order;
    },

    getAdminStats() {
      const orders = this.data.orders;
      return {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        inProgressOrders: orders.filter(o => ['in_progress', 'review'].includes(o.status)).length,
        completedOrders: orders.filter(o => o.status === 'completed').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
        totalUsers: this.data.users.filter(u => u.role !== 'admin').length,
        totalRevenue: orders
          .filter(o => o.status === 'completed')
          .reduce((sum, o) => sum + o.price, 0)
      };
    },

    getProjectsByUser(userId) {
      return this.data.projects
        .filter(p => p.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  };
}

module.exports = { getDb };
