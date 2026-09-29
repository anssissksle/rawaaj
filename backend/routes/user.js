const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;
    const orders = db.getOrdersByUser(userId);

    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      inProgressOrders: orders.filter(o => ['in_progress', 'review'].includes(o.status)).length
    };

    res.json({
      success: true,
      data: {
        stats,
        recentOrders: orders.slice(0, 5),
        projects: db.getProjectsByUser(userId).slice(0, 5)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'حدث خطأ في جلب لوحة التحكم' });
  }
});

router.put('/profile', authMiddleware, (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'الاسم مطلوب' });

    const db = getDb();
    const user = db.updateUser(req.user.id, { name, phone: phone || null });
    res.json({
      success: true,
      message: 'تم تحديث البيانات بنجاح',
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'حدث خطأ في التحديث' });
  }
});

router.put('/password', authMiddleware, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' });
    }

    const db = getDb();
    const user = db.findUserById(req.user.id);
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' });
    }

    db.updateUser(req.user.id, { password: bcrypt.hashSync(newPassword, 10) });
    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'حدث خطأ' });
  }
});

router.get('/projects', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    res.json({ success: true, data: db.getProjectsByUser(req.user.id) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'حدث خطأ' });
  }
});

module.exports = router;
