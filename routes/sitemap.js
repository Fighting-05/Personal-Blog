const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Category = require('../models/Category');
const { pool } = require('../database/init');

router.get('/posts', async (req, res) => {
  try {
    const { posts } = await Post.findAll({ page: 1, limit: 1000, status: 'published' });
    res.json(posts.map(p => ({
      title: p.title,
      slug: p.slug,
      created_at: p.created_at,
      updated_at: p.updated_at
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
