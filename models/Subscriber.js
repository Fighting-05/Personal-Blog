const { pool } = require('../database/init');

class Subscriber {
  static async subscribe(email) {
    const [existing] = await pool.execute('SELECT id FROM subscribers WHERE email = ?', [email]);
    if (existing.length > 0) {
      throw new Error('该邮箱已订阅');
    }
    await pool.execute('INSERT INTO subscribers (email) VALUES (?)', [email]);
    return true;
  }

  static async unsubscribe(email) {
    await pool.execute('DELETE FROM subscribers WHERE email = ?', [email]);
  }

  static async count() {
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM subscribers');
    return rows[0].count;
  }

  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM subscribers ORDER BY created_at DESC');
    return rows;
  }
}

module.exports = Subscriber;
