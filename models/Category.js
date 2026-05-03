const { pool } = require('../database/init');

class Category {
  static async findAll() {
    const [rows] = await pool.execute(`
      SELECT c.*, COUNT(p.id) as post_count
      FROM categories c
      LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    return rows;
  }

  static async findBySlug(slug) {
    const [rows] = await pool.execute('SELECT * FROM categories WHERE slug = ?', [slug]);
    return rows[0] || null;
  }

  static async create({ name, slug, description }) {
    const [result] = await pool.execute(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
      [name, slug, description]
    );
    const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    return rows[0] || null;
  }

  static async update(id, { name, slug, description }) {
    await pool.execute(
      'UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?',
      [name, slug, description, id]
    );
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
    return result;
  }
}

module.exports = Category;
