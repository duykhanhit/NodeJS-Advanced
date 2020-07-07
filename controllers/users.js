const path = require('path');
const User = require('../models/User');
const asyncHandle = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');

//@desc      GET all users
//@route     GET /api/v1/users
//@access    private/admin

module.exports.getUsers = asyncHandle(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@desc      GET single user
//@route     GET /api/v1/users/:id
//@access    private/admin

module.exports.getUser = asyncHandle(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if(!user){
    return next(new ErrorResponse(`User is not exist with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

//@desc      Create new user
//@route     POST /api/v1/users
//@access    private/admin

module.exports.createUser = asyncHandle(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

//@desc      Update single user
//@route     PUT /api/v1/users/:id
//@access    private/admin

module.exports.updateUser = asyncHandle(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if(!user){
    return next(new ErrorResponse(`User is not exist with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

//@desc      Delete user
//@route     DELETE /api/v1/users/:id
//@access    private/admin

module.exports.deleteUser = asyncHandle(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if(!user){
    return next(new ErrorResponse(`User is not exist with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});