const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'blog-jwt-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function jwtAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : (req.query.token || req.cookies?.token);

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: '令牌无效或已过期' });
  }

  req.user = decoded;
  req.userId = decoded.id;
  req.userRole = decoded.role;
  next();
}

function isAdmin(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
}

module.exports = { generateToken, verifyToken, jwtAuth, isAdmin, JWT_SECRET };
