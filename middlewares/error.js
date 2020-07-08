const ErrorResponse = require('../utils/errorResponse');

const errorHandle = (err, req, res, next) => {

  let error = { ...err };

  error.message = err.message;

  // Log error on dev
  console.log(err.stack);

  // MongoDB bad ObjectID
  if(err.name === 'CastError'){
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  //MongoDB duplicate value key
  if(err.code === 11000){
    const message = 'Duplicate value';
    error = new ErrorResponse(message, 400);
  }

  // MongoDB validation failed
  if(err.name === 'ValidationError'){
    const message = Object.values(err.errors).map(value => value.message);
    error = new ErrorResponse(message, 400);
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
}

module.exports = errorHandle;