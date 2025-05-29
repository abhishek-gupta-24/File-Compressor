const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');

  const inputPath = path.resolve(req.file.path);
  const outputPath = path.resolve('output/compressed.huff');

  const cmd = `./compressor compress "${inputPath}" "${outputPath}"`;

  exec(cmd, (error, stdout, stderr) => {
    fs.unlink(inputPath, () => {}); // delete uploaded input file
    if (error) {
      console.error('Compression error:', error);
      return res.status(500).send('Compression failed');
    }

    res.download(outputPath, 'compressed.huff', (err) => {
      if (err) console.error('File download error:', err);
      fs.unlink(outputPath, () => {}); // delete output file after download
    });
  });
});

module.exports = router;
