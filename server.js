const express = require('express');
const dotenv = require('dotenv');

const bootcamps = require('./routes/bootcamps');

dotenv.config({ path: './config/config.env'});

const app = express();

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Init project');
});

app.use('/api/v1/bootcamps', bootcamps);

app.listen(
  PORT, 
  console.log(`Server running on ${process.env.NODE_ENV} mode in port ${PORT}`)
);