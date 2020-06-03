const express = require('express');
const dotenv = require('dotenv');
const logger = require('./middlewares/logger');
const errorHandle = require('./middlewares/error');
const morgan = require('morgan');
const connectDB = require('./config/db');

dotenv.config({ path: './config/config.env'});

connectDB();

const bootcamps = require('./routes/bootcamps');

const app = express();

// Body parser 
app.use(express.json());

// Dev logging middleware
if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.send('Init project');
});

app.use('/api/v1/bootcamps', bootcamps);

app.use(errorHandle);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT, 
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

//Handle unhandle promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // close server
  server.close(() => process.exit(1));
});