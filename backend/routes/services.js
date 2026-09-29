const express = require('express');
const { getDb } = require('../db/database');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const services = db.getServices().map(s => ({
      id: s.id, title: s.title, description: s.description,
      price: s.price, icon: s.icon, category: s.category
    }));
    res.json({ success: true, data: services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'حدث خطأ في جلب الخدمات' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const service = db.getService(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'الخدمة غير موجودة' });
    res.json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: 'حدث خطأ' });
  }
});

module.exports = router;
