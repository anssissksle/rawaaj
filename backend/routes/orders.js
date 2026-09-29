const express = require('express');
const { getDb } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, (req, res) => {
  try {
    const { type, item_id, notes } = req.body;
    const userId = req.user.id;
    const db = getDb();

    if (!type || !item_id || !['service', 'package'].includes(type)) {
      return res.status(400).json({ success: false, message: 'بيانات الطلب غير مكتملة' });
    }

    let itemName, price;
    if (type === 'service') {
      const service = db.getService(item_id);
      if (!service) return res.status(404).json({ success: false, message: 'الخدمة غير موجودة' });
      itemName = service.title;
      price = service.price;
    } else {
      const pkg = db.getPackage(item_id);
      if (!pkg) return res.status(404).json({ success: false, message: 'الباقة غير موجودة' });
      itemName = pkg.name;
      price = pkg.price;
    }

    const order = db.createOrder({
      user_id: userId, type, item_id: Number(item_id),
      item_name: itemName, price, notes
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الطلب بنجاح',
      data: { id: order.id, type, item_name: itemName, price, status: 'pending' }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'حدث خطأ في إنشاء الطلب' });
  }
});

router.get('/', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const orders = db.getOrdersByUser(req.user.id);
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'حدث خطأ في جلب الطلبات' });
  }
});

router.get('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const order = db.getOrder(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'حدث خطأ' });
  }
});

module.exports = router;
