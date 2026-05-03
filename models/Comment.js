const { pool } = require('../database/init');

class Comment {
  static async findByPostId(postId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const [comments] = await pool.execute(`
      SELECT c.*, u.username, u.avatar
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ? AND c.parent_id IS NULL
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [postId, String(limit), String(offset)]);

    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM comments WHERE post_id = ? AND parent_id IS NULL', [postId]
    );
    const total = countRows[0].total;

    for (const comment of comments) {
      comment.displayName = comment.username || comment.guest_name || '匿名';
      const [replies] = await pool.execute(`
        SELECT c.*, u.username, u.avatar
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.parent_id = ?
        ORDER BY c.created_at ASC
      `, [comment.id]);
      replies.forEach(r => { r.displayName = r.username || r.guest_name || '匿名'; });
      comment.replies = replies;
    }

    return { comments, total };
  }

  static async create({ content, postId, userId, parentId = null, guestName = null, guestEmail = null }) {
    const [result] = await pool.execute(
      'INSERT INTO comments (content, post_id, user_id, parent_id, guest_name, guest_email) VALUES (?, ?, ?, ?, ?, ?)',
      [content, postId, userId, parentId, guestName, guestEmail]
    );
    const [rows] = await pool.execute(`
      SELECT c.*, u.username, u.avatar
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);
    const row = rows[0] || null;
    if (row) row.displayName = row.username || row.guest_name || '匿名';
    return row;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM comments WHERE id = ? OR parent_id = ?', [id, id]
    );
    return result;
  }

  static async findByAdmin({ page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const [comments] = await pool.execute(`
      SELECT c.*, u.username, u.avatar, p.title as post_title, p.slug as post_slug
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN posts p ON c.post_id = p.id
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [String(limit), String(offset)]);
    const [countRows] = await pool.execute('SELECT COUNT(*) as total FROM comments');
    const total = countRows[0].total;
    comments.forEach(c => { c.displayName = c.username || c.guest_name || '匿名'; });
    return { comments, total, page, totalPages: Math.ceil(total / limit) };
  }
}

module.exports = Comment;
