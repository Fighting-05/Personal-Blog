const { pool } = require('../database/init');

class Post {
  static async findAll({ page = 1, limit = 10, category, tag, search, status = 'published' } = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE p.status = ?';
    const params = [status];
    let joinClause = '';

    if (category) {
      whereClause += ' AND c.slug = ?';
      params.push(category);
    }
    if (tag) {
      joinClause += ' JOIN post_tags pt2 ON p.id = pt2.post_id JOIN tags t2 ON pt2.tag_id = t2.id';
      whereClause += ' AND t2.slug = ?';
      params.push(tag);
    }
    if (search) {
      whereClause += ' AND (p.title LIKE ? OR p.summary LIKE ? OR p.content LIKE ?)';
      const q = `%${search}%`;
      params.push(q, q, q);
    }

    const countSql = `SELECT COUNT(DISTINCT p.id) as total FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      ${joinClause}
      ${whereClause}`;
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0].total;

    const dataSql = `SELECT DISTINCT p.*, u.username as author_name, u.avatar as author_avatar, c.name as category_name, c.slug as category_slug,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${joinClause}
      ${whereClause}
      ORDER BY p.is_pinned DESC, p.created_at DESC
      LIMIT ? OFFSET ?`;

    const [posts] = await pool.execute(dataSql, [...params, String(limit), String(offset)]);

    const totalPages = Math.ceil(total / limit);
    return { posts, total, page, totalPages };
  }

  static async findBySlug(slug) {
    const [rows] = await pool.execute(`
      SELECT p.*, u.username as author_name, u.avatar as author_avatar, u.bio as author_bio,
        c.name as category_name, c.slug as category_slug,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ?
    `, [slug]);

    const post = rows[0] || null;

    if (post) {
      const [tags] = await pool.execute(`
        SELECT t.* FROM tags t
        JOIN post_tags pt ON t.id = pt.tag_id
        WHERE pt.post_id = ?
      `, [post.id]);
      post.tags = tags;
    }
    return post;
  }

  static async findById(id) {
    const [rows] = await pool.execute(`
      SELECT p.*, u.username as author_name, c.name as category_name, c.slug as category_slug
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);
    return rows[0] || null;
  }

  static async incrementView(slug) {
    const [result] = await pool.execute(
      'UPDATE posts SET view_count = view_count + 1 WHERE slug = ?', [slug]
    );
    return result;
  }

  static async create({ title, slug, content, summary, coverImage, authorId, categoryId, status, tags }) {
    const [result] = await pool.execute(`
      INSERT INTO posts (title, slug, content, summary, cover_image, author_id, category_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, slug, content, summary, coverImage, authorId, categoryId, status]);

    const postId = result.insertId;

    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');
        await pool.execute(
          'INSERT IGNORE INTO tags (name, slug) VALUES (?, ?)', [tagName, tagSlug]
        );
        const [tagRows] = await pool.execute(
          'SELECT id FROM tags WHERE slug = ?', [tagSlug]
        );
        if (tagRows.length > 0) {
          await pool.execute(
            'INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)', [postId, tagRows[0].id]
          );
        }
      }
    }
    return this.findById(postId);
  }

  static async update(id, { title, slug, content, summary, coverImage, categoryId, status, tags }) {
    await pool.execute(`
      UPDATE posts SET title = ?, slug = ?, content = ?, summary = ?, cover_image = ?,
        category_id = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `, [title, slug, content, summary, coverImage, categoryId, status, id]);

    if (tags !== undefined) {
      await pool.execute('DELETE FROM post_tags WHERE post_id = ?', [id]);
      for (const tagName of tags) {
        const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');
        await pool.execute(
          'INSERT IGNORE INTO tags (name, slug) VALUES (?, ?)', [tagName, tagSlug]
        );
        const [tagRows] = await pool.execute(
          'SELECT id FROM tags WHERE slug = ?', [tagSlug]
        );
        if (tagRows.length > 0) {
          await pool.execute(
            'INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)', [id, tagRows[0].id]
          );
        }
      }
    }
    return this.findById(id);
  }

  static async togglePin(id) {
    const [rows] = await pool.execute('SELECT is_pinned FROM posts WHERE id = ?', [id]);
    if (rows.length > 0) {
      await pool.execute(
        'UPDATE posts SET is_pinned = ? WHERE id = ?', [rows[0].is_pinned ? 0 : 1, id]
      );
    }
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM posts WHERE id = ?', [id]);
    return result;
  }

  static async getArchive() {
    const [rows] = await pool.execute(`
      SELECT YEAR(created_at) as year, MONTH(created_at) as month,
        COUNT(*) as count
      FROM posts WHERE status = 'published'
      GROUP BY year, month
      ORDER BY year DESC, month DESC
    `);
    return rows;
  }

  static async getHotPosts(limit = 5) {
    const [rows] = await pool.execute(`
      SELECT id, title, slug, view_count FROM posts
      WHERE status = 'published'
      ORDER BY view_count DESC LIMIT ?
    `, [String(limit)]);
    return rows;
  }

  static async getTags() {
    const [rows] = await pool.execute(`
      SELECT t.*, COUNT(pt.post_id) as post_count
      FROM tags t
      LEFT JOIN post_tags pt ON t.id = pt.tag_id
      GROUP BY t.id
      ORDER BY post_count DESC
    `);
    return rows;
  }
}

module.exports = Post;
