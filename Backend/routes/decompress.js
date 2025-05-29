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
  const outputPath = path.resolve('output/decompressed.txt');

  const cmd = `compressor.exe decompress "${inputPath}" "${outputPath}"`;

  exec(cmd, (error, stdout, stderr) => {
    fs.unlink(inputPath, () => {}); // delete uploaded input file
    if (error) {
      console.error('Decompression error:', error);
      return res.status(500).send('Decompression failed');
    }

    res.download(outputPath, 'decompressed.txt', (err) => {
      if (err) console.error('File download error:', err);
      fs.unlink(outputPath, () => {}); // delete output file after download
    });
  });
});

module.exports = router;
