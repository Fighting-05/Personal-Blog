const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { pool } = require('../database/init');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const imageStorage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'public', 'uploads'),
  filename: (req, file, cb) => {
    cb(null, 'editor-' + Date.now() + path.extname(file.originalname));
  }
});
const imageUpload = multer({ storage: imageStorage, limits: { fileSize: 10 * 1024 * 1024 } });

router.use(isAuthenticated, isAdmin);

router.get('/posts', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM posts WHERE status = ? ORDER BY created_at DESC', ['published']);
    const exports = rows.map(p => ({
      title: p.title, slug: p.slug, content: p.content, summary: p.summary,
      created_at: p.created_at, view_count: p.view_count, category_id: p.category_id
    }));
    if (req.query.format === 'markdown') {
      let md = '';
      exports.forEach(p => { md += `# ${p.title}\n\n${p.summary || ''}\n\n${p.content}\n\n---\n\n`; });
      res.set('Content-Type', 'text/markdown; charset=utf-8');
      res.set('Content-Disposition', 'attachment; filename=blog-posts.md');
      res.send(md);
    } else {
      res.json(exports);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/posts/batch', async (req, res) => {
  const { ids, action, status } = req.body;
  if (!ids || !ids.length) return res.status(400).json({ error: '请选择文章' });
  try {
    if (action === 'delete') {
      await pool.execute(`DELETE FROM posts WHERE id IN (${ids.map(() => '?').join(',')})`, ids);
    } else if (action === 'status' && status) {
      await pool.execute(`UPDATE posts SET status = ? WHERE id IN (${ids.map(() => '?').join(',')})`, [status, ...ids]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/upload-image', imageUpload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '请选择图片' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

module.exports = router;
