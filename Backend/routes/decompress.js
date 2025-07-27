const express = require('express');
const router = express.Router();
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const upload = require('../middleware/upload'); // ✅ same middleware

router.post('/', upload.single('file'), (req, res) => {
  const inputPath = path.join(__dirname, '../uploads/input.huff');
  const outputPath = path.resolve('output/decompressed.txt');

  const cmd = `./compressor decompress "${inputPath}" "${outputPath}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('Decompression error:', error);
      return res.status(500).send('Decompression failed');
    }

    res.download(outputPath, 'decompressed.txt', (err) => {
      if (err) console.error('Download error:', err);
      fs.unlink(outputPath, () => {});
    });
  });
});

module.exports = router;
