const express = require('express');
const router = express.Router();
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const upload = require('../middleware/upload'); // ✅ unified middleware

router.post('/', upload.single('file'), (req, res) => {
  const inputPath = path.join(__dirname, '../uploads/input.txt');
  const outputPath = path.resolve('output/compressed.huff');

  const cmd = `./compressor compress "${inputPath}" "${outputPath}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('Compression error:', error);
      return res.status(500).send('Compression failed');
    }

    res.download(outputPath, 'compressed.huff', (err) => {
      if (err) console.error('Download error:', err);
      fs.unlink(outputPath, () => {});
    });
  });
});

module.exports = router;
