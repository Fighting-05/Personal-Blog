const { pool } = require('../database/init');

class User {
  static async findByUsername(username) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, email, avatar, role, bio, created_at FROM users WHERE id = ?', [id]
    );
    return rows[0] || null;
  }

  static async create({ username, email, password }) {
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
    return this.findById(result.insertId);
  }

  static async updateProfile(id, { username, email, avatar, bio }) {
    await pool.execute(
      'UPDATE users SET username = ?, email = ?, avatar = ?, bio = ? WHERE id = ?',
      [username, email, avatar, bio, id]
    );
    return this.findById(id);
  }

  static async updatePassword(id, password) {
    const [result] = await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?', [password, id]
    );
    return result;
  }

  static async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [users] = await pool.execute(
      'SELECT id, username, email, avatar, role, bio, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [String(limit), String(offset)]
    );
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;
    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result;
  }
}

module.exports = User;
