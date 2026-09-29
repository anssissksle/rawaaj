const express = require('express');
const { getDb } = require('../db/database');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// كل الراوتات هنا محمية بالأدمن فقط
router.use(adminMiddleware);

// إحصائيات لوحة التحكم
router.get('/dashboard', (req, res) => {
  try {
    const db = getDb();
    const stats = db.getAdminStats();
    const recentOrders = db.getAllOrders().slice(0, 10);
    res.json({ success: true, data: { stats, recentOrders } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'حدث خطأ' });
  }
});

// كل الطلبات
router.get('/orders', (req, res) => {
  try {
    const db = getDb();
    const orders = db.getAllOrders();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'حدث خطأ في جلب الطلبات' });
  }
});

// طلب واحد
router.get('/orders/:id', (req, res) => {
  try {
    const db = getDb();
    const order = db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'حدث خطأ' });
  }
});

// تحديث حالة الطلب (قبول / تنفيذ / إنهاء ...)
router.patch('/orders/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'in_progress', 'review', 'completed', 'cancelled'];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'حالة غير صالحة. الحالات المتاحة: ' + allowed.join(', ')
      });
    }

    const db = getDb();
    const order = db.updateOrderStatus(req.params.id, status);

    if (!order) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }

    res.json({
      success: true,
      message: 'تم تحديث حالة الطلب بنجاح',
      data: order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'حدث خطأ في التحديث' });
  }
});

// كل المستخدمين
router.get('/users', (req, res) => {
  try {
    const db = getDb();
    const users = db.getAllUsers().filter(u => u.role !== 'admin');
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'حدث خطأ' });
  }
});

module.exports = router;
