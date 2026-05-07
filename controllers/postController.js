const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Category = require('../models/Category');
const { pool } = require('../database/init');

exports.getPosts = async (req, res) => {
  const { page, limit, category, tag, search, status } = req.query;
  const result = await Post.findAll({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    category, tag, search,
    status: status || 'published'
  });
  res.json(result);
};

exports.getPost = async (req, res) => {
  const { slug } = req.params;
  const post = await Post.findBySlug(slug);
  if (!post) return res.status(404).json({ error: '文章不存在' });

  await Post.incrementView(slug);

  const comments = await Comment.findByPostId(post.id);

  const [prevRows] = await pool.execute(
    "SELECT title, slug FROM posts WHERE id < ? AND status = 'published' ORDER BY id DESC LIMIT 1",
    [post.id]
  );
  const prevPost = prevRows[0] || null;

  const [nextRows] = await pool.execute(
    "SELECT title, slug FROM posts WHERE id > ? AND status = 'published' ORDER BY id ASC LIMIT 1",
    [post.id]
  );
  const nextPost = nextRows[0] || null;

  let userLiked = false;
  if (req.userId) {
    const [likeRows] = await pool.execute(
      'SELECT * FROM likes WHERE user_id = ? AND post_id = ?',
      [req.userId, post.id]
    );
    userLiked = likeRows.length > 0;
  }

  res.json({ post, comments, prevPost, nextPost, userLiked });
};

exports.createPost = async (req, res) => {
  const { title, content, summary, categoryId, status, tags } = req.body;
  if (!title || !content) return res.status(400).json({ error: '标题和内容不能为空' });

  const slug = title.toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '') + '-' + Date.now();

  const coverImage = req.file ? `/uploads/${req.file.filename}` : '';
  try {
    const tagArray = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    const post = await Post.create({
      title, slug, content, summary, coverImage,
      authorId: req.userId, categoryId: categoryId || null,
      status: status || 'published', tags: tagArray
    });
    res.json({ success: true, post });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content, summary, categoryId, status, tags, slug: reqSlug } = req.body;
  if (!title || !content) return res.status(400).json({ error: '标题和内容不能为空' });

  const existingPost = await Post.findById(id);
  if (!existingPost) return res.status(404).json({ error: '文章不存在' });

  let slug;
  if (reqSlug) {
    slug = reqSlug;
  } else if (title !== existingPost.title) {
    slug = title.toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now();
  } else {
    slug = existingPost.slug;
  }

  const coverImage = req.file ? `/uploads/${req.file.filename}` : req.body.coverImage;
  try {
    const tagArray = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    const post = await Post.update(id, {
      title, slug, content, summary, coverImage,
      categoryId: categoryId || null, status: status || 'published', tags: tagArray
    });
    res.json({ success: true, post });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  await Post.delete(req.params.id);
  res.json({ success: true });
};

exports.togglePin = async (req, res) => {
  await Post.togglePin(req.params.id);
  res.json({ success: true });
};

exports.likePost = async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: '请先登录' });
  const { postId } = req.body;
  try {
    const [existing] = await pool.execute(
      'SELECT * FROM likes WHERE user_id = ? AND post_id = ?',
      [req.userId, postId]
    );
    if (existing.length > 0) {
      await pool.execute(
        'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
        [req.userId, postId]
      );
      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM likes WHERE post_id = ?', [postId]
      );
      return res.json({ success: true, liked: false, likeCount: countResult[0].total });
    } else {
      await pool.execute(
        'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
        [req.userId, postId]
      );
      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM likes WHERE post_id = ?', [postId]
      );
      return res.json({ success: true, liked: true, likeCount: countResult[0].total });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.likeComment = async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: '请先登录' });
  const commentId = parseInt(req.params.id);
  try {
    const [existing] = await pool.execute(
      'SELECT * FROM comment_likes WHERE user_id = ? AND comment_id = ?',
      [req.userId, commentId]
    );
    if (existing.length > 0) {
      await pool.execute(
        'DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?',
        [req.userId, commentId]
      );
    } else {
      await pool.execute(
        'INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)',
        [req.userId, commentId]
      );
    }
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM comment_likes WHERE comment_id = ?', [commentId]
    );
    res.json({ success: true, liked: existing.length === 0, likeCount: countResult[0].total });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createComment = async (req, res) => {
  const { content, postId, parentId, guestName, guestEmail } = req.body;
  if (!content || !postId) return res.status(400).json({ error: '评论内容不能为空' });

  const userId = req.userId || null;

  if (!userId && !guestName) {
    return res.status(400).json({ error: '请填写昵称' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.socket?.remoteAddress;
  let ipLocation = '';
  try {
    const geo = require('geoip-lite');
    const cleanIP = (ip || '').replace('::ffff:', '');
    if (cleanIP && cleanIP !== '127.0.0.1' && cleanIP !== '::1') {
      const geoData = geo.lookup(cleanIP);
      if (geoData) ipLocation = [geoData.country, geoData.city].filter(Boolean).join(' ');
    }
  } catch {}

  const comment = await Comment.create({
    content, postId,
    userId,
    parentId: parentId || null,
    guestName: userId ? null : (guestName || null),
    guestEmail: userId ? null : (guestEmail || null),
    ipLocation,
  });
  res.json({ success: true, comment });
};

exports.deleteComment = async (req, res) => {
  await Comment.delete(req.params.id);
  res.json({ success: true });
};

exports.getCategories = async (req, res) => {
  const categories = await Category.findAll();
  res.json(categories);
};

exports.getHotPosts = async (req, res) => {
  const posts = await Post.getHotPosts(parseInt(req.query.limit) || 5);
  res.json(posts);
};

exports.getArchive = async (req, res) => {
  const year = req.query.year;
  const month = req.query.month;
  const full = req.query.full;
  let posts = [];
  if (year && month) {
    const [rows] = await pool.execute(
      "SELECT id, title, slug, view_count, created_at FROM posts WHERE YEAR(created_at) = ? AND MONTH(created_at) = ? AND status = 'published' ORDER BY created_at DESC",
      [year, month]
    );
    posts = rows;
  } else if (year) {
    const [rows] = await pool.execute(
      "SELECT id, title, slug, view_count, created_at FROM posts WHERE YEAR(created_at) = ? AND status = 'published' ORDER BY created_at DESC",
      [year]
    );
    posts = rows;
  }
  const archiveData = await Post.getArchive();

  let groups = [];
  if (full) {
    for (const item of archiveData) {
      const [rows] = await pool.execute(
        "SELECT id, title, slug, view_count, created_at FROM posts WHERE YEAR(created_at) = ? AND MONTH(created_at) = ? AND status = 'published' ORDER BY created_at DESC",
        [item.year, item.month]
      );
      groups.push({ year: item.year, month: item.month, count: item.count, posts: rows });
    }
  }

  res.json({ archive: archiveData, posts, groups, year, month });
};

exports.getTags = async (req, res) => {
  const tags = await Post.getTags();
  res.json(tags);
};

exports.getStats = async (req, res) => {
  try {
    const [catRows] = await pool.execute(
      `SELECT c.name, c.slug, COUNT(p.id) as count
       FROM categories c LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
       GROUP BY c.id ORDER BY count DESC`
    );
    const [monthRows] = await pool.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
       FROM posts WHERE status = 'published' AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY month ORDER BY month ASC`
    );
    const [viewRows] = await pool.execute(
      `SELECT SUM(view_count) as totalViews, COUNT(*) as totalPosts FROM posts WHERE status = 'published'`
    );
    const [commentCount] = await pool.execute(`SELECT COUNT(*) as count FROM comments`);
    res.json({
      categories: catRows,
      monthly: monthRows,
      totalViews: viewRows[0]?.totalViews || 0,
      totalPosts: viewRows[0]?.totalPosts || 0,
      totalComments: commentCount[0]?.count || 0,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
