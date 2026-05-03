const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'public', 'uploads'),
  filename: (req, file, cb) => {
    const prefix = file.fieldname === 'avatar' ? 'avatar' : 'cover';
    cb(null, prefix + '-' + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
  if (allowed.test(path.extname(file.originalname))) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件 (jpg, jpeg, png, gif, webp)'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const avatarUpload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

module.exports = { upload, avatarUpload };
