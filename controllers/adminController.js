const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Category = require('../models/Category');
const User = require('../models/User');
const { pool } = require('../database/init');

exports.getDashboard = async (req, res) => {
  const [postCountRows] = await pool.execute('SELECT COUNT(*) as total FROM posts');
  const postCount = postCountRows[0].total;

  const [commentCountRows] = await pool.execute('SELECT COUNT(*) as total FROM comments');
  const commentCount = commentCountRows[0].total;

  const [userCountRows] = await pool.execute('SELECT COUNT(*) as total FROM users');
  const userCount = userCountRows[0].total;

  const [categoryCountRows] = await pool.execute('SELECT COUNT(*) as total FROM categories');
  const categoryCount = categoryCountRows[0].total;

  const [totalViewsRows] = await pool.execute('SELECT COALESCE(SUM(view_count), 0) as total FROM posts');
  const totalViews = totalViewsRows[0].total;

  const [recentPosts] = await pool.execute(`
    SELECT p.*, u.username as author_name, c.name as category_name
    FROM posts p LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC LIMIT 5
  `);

  const [recentComments] = await pool.execute(`
    SELECT c.*, u.username, p.title as post_title, p.slug as post_slug
    FROM comments c LEFT JOIN users u ON c.user_id = u.id
    LEFT JOIN posts p ON c.post_id = p.id
    ORDER BY c.created_at DESC LIMIT 5
  `);

  res.json({ stats: { postCount, commentCount, userCount, categoryCount, totalViews }, recentPosts, recentComments });
};

exports.listPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const { status } = req.query;
  const result = await Post.findAll({ page, limit: 15, status: status || undefined });
  res.json(result);
};

exports.listComments = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const result = await Comment.findByAdmin({ page });
  res.json(result);
};

exports.deleteComment = async (req, res) => {
  await Comment.delete(req.params.id);
  res.json({ success: true });
};

exports.listUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const result = await User.findAll(page);
  res.json(result);
};

exports.deleteUser = async (req, res) => {
  if (req.params.id == req.userId) {
    return res.status(400).json({ error: '不能删除自己' });
  }
  await User.delete(req.params.id);
  res.json({ success: true });
};

exports.getCategories = async (req, res) => {
  const categories = await Category.findAll();
  res.json(categories);
};

exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: '分类名不能为空' });
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  try {
    const category = await Category.create({ name, slug, description: description || '' });
    res.json({ success: true, category });
  } catch (err) {
    res.status(400).json({ error: '分类已存在' });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: '分类名不能为空' });
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  try {
    await Category.update(id, { name, slug, description: description || '' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  await Category.delete(req.params.id);
  res.json({ success: true });
};
