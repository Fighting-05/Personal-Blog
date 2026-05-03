const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');

router.post('/', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: '请输入邮箱' });
  try {
    await Subscriber.subscribe(email);
    res.json({ success: true, message: '订阅成功' });
  } catch (err) {
    res.status(400).json({ error: err.message || '订阅失败' });
  }
});

router.get('/count', async (req, res) => {
  const count = await Subscriber.count();
  res.json({ count });
});

module.exports = router;
