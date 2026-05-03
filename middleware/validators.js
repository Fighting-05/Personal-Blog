const { body, param, query, validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: '请求参数验证失败',
      details: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
}

const registerRules = [
  body('username').trim().isLength({ min: 2, max: 50 }).withMessage('用户名长度需要2-50个字符'),
  body('email').trim().isEmail().withMessage('邮箱格式不正确'),
  body('password').isLength({ min: 6 }).withMessage('密码长度至少6位')
];

const loginRules = [
  body('username').trim().notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
];

const updatePasswordRules = [
  body('currentPassword').notEmpty().withMessage('当前密码不能为空'),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码长度至少6位')
];

const updateProfileRules = [
  body('username').optional().trim().isLength({ min: 2, max: 50 }).withMessage('用户名长度需要2-50个字符'),
  body('email').optional().trim().isEmail().withMessage('邮箱格式不正确')
];

const createPostRules = [
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('标题不能为空且不超过255字'),
  body('content').trim().notEmpty().withMessage('内容不能为空')
];

const updatePostRules = [
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('标题不能为空且不超过255字'),
  body('content').trim().notEmpty().withMessage('内容不能为空')
];

const createCommentRules = [
  body('content').trim().notEmpty().withMessage('评论内容不能为空'),
  body('postId').isInt({ min: 1 }).withMessage('文章ID无效'),
  body('guestName').optional().trim().isLength({ max: 50 }).withMessage('昵称不能超过50字'),
  body('guestEmail').optional().trim().isEmail().withMessage('邮箱格式不正确')
];

const likeRules = [
  body('postId').isInt({ min: 1 }).withMessage('文章ID无效')
];

const categoryRules = [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('分类名不能为空且不超过50字')
];

const idParam = [
  param('id').isInt({ min: 1 }).withMessage('ID参数无效')
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  updatePasswordRules,
  updateProfileRules,
  createPostRules,
  updatePostRules,
  createCommentRules,
  likeRules,
  categoryRules,
  idParam
};
