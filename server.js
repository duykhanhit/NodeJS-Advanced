const express = require('express');
const path = require('path');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const xss = require('xss-clean');
const rateLimit = require("express-rate-limit");
const hpp = require('hpp');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./middlewares/logger');
const errorHandle = require('./middlewares/error');
const morgan = require('morgan');
const connectDB = require('./config/db');

dotenv.config({ path: './config/config.env'});

connectDB();

const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

// Body parser 
app.use(express.json());
app.use(cookieParser());

// Upload file
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Set limiter request
const limiter = rateLimit({
  windowMs: 10*60*1000,
  max: 50
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable cors
app.use(cors());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Dev logging middleware
if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.send('Init project');
});

app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

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