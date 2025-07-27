const multer = require('multer');
const path = require('path');

// Dynamic filename and mimetype check based on file extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fixedName = ext === '.txt' ? 'input.txt' : 'input.huff';
    cb(null, fixedName);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (ext === '.txt' || ext === '.huff') {
    cb(null, true);
  } else {
    cb(new Error('Only .txt or .huff files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
