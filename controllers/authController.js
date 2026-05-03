const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: '请填写所有字段' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: '密码长度至少6位' });
  }
  try {
    const hash = bcrypt.hashSync(password, 10);
    await User.create({ username, email, password: hash });
    res.json({ success: true, message: '注册成功' });
  } catch (err) {
    res.status(400).json({ error: '用户名或邮箱已存在' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findByUsername(username);
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.userRole = user.role;
  req.session.userAvatar = user.avatar;

  const token = generateToken({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  });

  res.json({
    success: true,
    token,
    user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, role: user.role, bio: user.bio }
  });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
};

exports.me = async (req, res) => {
  const userId = req.userId || (req.user && req.user.id);
  if (!userId) {
    return res.status(401).json({ error: '未登录' });
  }
  const user = await User.findById(userId);
  if (!user) return res.status(401).json({ error: '用户不存在' });
  res.json({ user });
};

exports.updateProfile = async (req, res) => {
  const userId = req.userId || (req.user && req.user.id);
  const { username, email, bio } = req.body;
  const avatar = req.file ? `/uploads/${req.file.filename}` : req.body.avatar;
  try {
    const user = await User.updateProfile(userId, { username, email, avatar, bio });
    req.session.username = user.username;
    req.session.userAvatar = user.avatar;
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  const userId = req.userId || (req.user && req.user.id);
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: '请填写当前密码和新密码' });
  }
  const user = await User.findById(userId);
  const fullUser = await User.findByUsername(user.username);
  if (!bcrypt.compareSync(currentPassword, fullUser.password)) {
    return res.status(400).json({ error: '当前密码不正确' });
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  await User.updatePassword(userId, hash);
  res.json({ success: true, message: '密码修改成功' });
};
