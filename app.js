require('dotenv').config();

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'blog-secret-key-change-in-production') {
  console.warn('[WARNING] SESSION_SECRET 未设置或使用默认值，请在 .env 中设置一个强随机字符串');
}
if (!process.env.JWT_SECRET) {
  console.warn('[WARNING] JWT_SECRET 未设置，使用默认值，请在 .env 中设置 JWT_SECRET');
}

const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { initDatabase, seedData, pool } = require('./database/init');
const { requestLogger, errorLogger } = require('./middleware/logger');
const { initRedis, getRedisClient } = require('./middleware/cache');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: '登录尝试次数过多，请15分钟后再试' },
  standardHeaders: true,
  legacyHeaders: false
});

async function start() {
  await initDatabase();
  await seedData();
  await initRedis();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(requestLogger);

  app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

  app.use(session({
    secret: process.env.SESSION_SECRET || 'blog-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true
    }
  }));

  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/posts/comments', apiLimiter);
  app.use('/api/', apiLimiter);

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/posts', require('./routes/posts'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api/sitemap', require('./routes/sitemap'));
  app.use('/api/subscribe', require('./routes/subscribe'));
  app.use('/api/tools', require('./routes/tools'));
  app.use('/rss.xml', require('./routes/rss'));

  app.use(express.static(path.join(__dirname, 'client', 'dist')));

  const fs = require('fs');
  const indexHtml = fs.readFileSync(path.join(__dirname, 'client', 'dist', 'index.html'), 'utf-8');

  app.get('/post/:slug', async (req, res) => {
    try {
      const { pool } = require('./database/init');
      const [rows] = await pool.execute(
        'SELECT title, summary, cover_image, slug FROM posts WHERE slug = ? AND status = ?',
        [req.params.slug, 'published']
      );
      const post = rows[0];
      if (post) {
        const siteUrl = `${req.protocol}://${req.get('host')}`;
        let html = indexHtml;
        html = html.replace(/<title>.*?<\/title>/, `<title>${post.title} - 个人博客</title>`);
        const ogTags = `
<meta property="og:title" content="${post.title}" />
<meta property="og:description" content="${post.summary || ''}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${siteUrl}/post/${post.slug}" />
<meta property="og:image" content="${post.cover_image ? (post.cover_image.startsWith('http') ? post.cover_image : siteUrl + post.cover_image) : siteUrl + '/images/default-cover.png'}" />
<meta name="description" content="${post.summary || ''}" />`;
        html = html.replace('</head>', `${ogTags}\n</head>`);
        res.set('Content-Type', 'text/html; charset=utf-8');
        return res.send(html);
      }
    } catch (_) {}
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
  });

  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
    } else {
      res.status(404).json({ error: 'API not found' });
    }
  });

  app.use(errorLogger);

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      error: process.env.NODE_ENV === 'production'
        ? '服务器内部错误'
        : err.message
    });
  });

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Logs directory: ${path.join(__dirname, 'logs')}`);
  });

  const gracefulShutdown = async (signal) => {
    console.log(`\n[${signal}] 正在优雅关闭服务器...`);
    try {
      await pool.end();
      console.log('[Shutdown] 数据库连接池已关闭');
    } catch (err) {
      console.error('[Shutdown] 关闭数据库连接池失败:', err.message);
    }
    try {
      const redis = getRedisClient();
      if (redis) {
        await redis.quit();
        console.log('[Shutdown] Redis 连接已关闭');
      }
    } catch (err) {
      console.error('[Shutdown] 关闭 Redis 连接失败:', err.message);
    }
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
