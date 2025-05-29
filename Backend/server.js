const express = require('express');
const cors = require('cors');

const compressRoute = require('./routes/compress');
const decompressRoute = require('./routes/decompress');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/compress', compressRoute);
app.use('/api/decompress', decompressRoute);

app.get('/', (req, res) => {
  res.send({
    activeStatus: true,
    error:false
   })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
