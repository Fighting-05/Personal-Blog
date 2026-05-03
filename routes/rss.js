const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

router.get('/', async (req, res) => {
  try {
    const { posts } = await Post.findAll({ page: 1, limit: 20, status: 'published' });
    const siteUrl = `${req.protocol}://${req.get('host')}`;
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n`;
    xml += `<title>个人博客</title>\n<link>${siteUrl}</link>\n<description>个人博客 RSS 订阅</description>\n`;
    xml += `<atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>\n`;
    posts.forEach(p => {
      const url = `${siteUrl}/post/${p.slug}`;
      xml += `<item>\n<title><![CDATA[${p.title}]]></title>\n<link>${url}</link>\n`;
      xml += `<description><![CDATA[${p.summary || ''}]]></description>\n`;
      xml += `<pubDate>${new Date(p.created_at).toUTCString()}</pubDate>\n<guid>${url}</guid>\n</item>\n`;
    });
    xml += `</channel>\n</rss>`;
    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(xml);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
