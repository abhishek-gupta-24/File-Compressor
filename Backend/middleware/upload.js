const multer = require('multer');
const path = require('path');

// Storage config: save file as input.txt in uploads folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, 'input.txt'); // always save as input.txt
  }
});

// Filter to accept only text files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/plain') {
    cb(null, true);
  } else {
    cb(new Error('Only .txt files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
