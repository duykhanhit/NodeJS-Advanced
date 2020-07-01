const User = require('../models/User');
const asyncHandle = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');

//@desc      Register user
//@route     POST /api/v1/auth/register
//@access    public

module.exports.register = asyncHandle( async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role
  });

  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token
  });
});

//@desc      Login user
//@route     POST /api/v1/auth/login
//@access    public

module.exports.login = asyncHandle( async (req, res, next) => {
  const {email, password} = req.body;

  // Validation email & password
  if(!email || !password) {
    return next(new ErrorResponse(`Vui lòng nhập email và mật khẩu`,400));
  }

  // Find user
  const user = await User.findOne({ email }).select('+password');

  if(!user) {
    return next(new ErrorResponse(`Không tồn tại tài khoản`, 401));
  }

  const isMatch = await user.matchPassword(password);
  
  if(!isMatch){
    return next(new ErrorResponse(`Sai mật khẩu`, 401));
  }

  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token
  });
});