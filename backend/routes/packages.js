const express = require('express');
const { getDb } = require('../db/database');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = getDb();
    res.json({ success: true, data: db.getPackages() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'حدث خطأ في جلب الباقات' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const pkg = db.getPackage(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'الباقة غير موجودة' });
    res.json({ success: true, data: pkg });
  } catch (err) {
    res.status(500).json({ success: false, message: 'حدث خطأ' });
  }
});

module.exports = router;
