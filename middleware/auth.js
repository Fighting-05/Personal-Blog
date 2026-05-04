const { verifyToken } = require('../utils/jwt');

function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    req.userId = req.session.userId;
    req.userRole = req.session.userRole;
    req.user = { id: req.session.userId, role: req.session.userRole, username: req.session.username };
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
      req.userId = decoded.id;
      req.userRole = decoded.role;
      return next();
    }
  }

  res.status(401).json({ error: '未登录或登录已过期' });
}

function isAdmin(req, res, next) {
  if (req.session && req.session.userId && req.session.userRole === 'admin') {
    return next();
  }
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: '需要管理员权限' });
}

function optionalAuth(req, res, next) {
  if (req.session && req.session.userId) {
    req.userId = req.session.userId;
    req.userRole = req.session.userRole;
    req.user = { id: req.session.userId, role: req.session.userRole, username: req.session.username };
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
      req.userId = decoded.id;
      req.userRole = decoded.role;
    }
  }
  next();
}

function setLocals(req, res, next) {
  res.locals.currentUser = req.session.userId ? {
    id: req.session.userId,
    username: req.session.username,
    role: req.session.userRole,
    avatar: req.session.userAvatar
  } : null;
  res.locals.success = req.flash ? req.flash('success') : [];
  res.locals.error = req.flash ? req.flash('error') : [];
  next();
}

function redirectIfAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/');
  }
  next();
}

module.exports = { isAuthenticated, isAdmin, optionalAuth, setLocals, redirectIfAuth };
