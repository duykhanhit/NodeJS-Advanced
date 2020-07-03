const User = require('../models/User');
const asyncHandle = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const sendMail = require('../utils/sendEmail');

//@desc      Register user
//@route     POST /api/v1/auth/register
//@access    public

module.exports.register = asyncHandle(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role
  });

  sendTokenResponse(user, 200, res);
});

//@desc      Login user
//@route     POST /api/v1/auth/login
//@access    public

module.exports.login = asyncHandle(async (req, res, next) => {
  const { email, password } = req.body;

  // Validation email & password
  if (!email || !password) {
    return next(new ErrorResponse(`Vui lòng nhập email và mật khẩu`, 400));
  }

  // Find user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse(`Không tồn tại tài khoản`, 401));
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse(`Sai mật khẩu`, 401));
  }

  sendTokenResponse(user, 200, res);
});

// Get token from model create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  }

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode)
    .cookie(
      'token',
      token,
      options
    )
    .json({
      success: true,
      token
    });
}

//@desc      Get current logged in user
//@route     POST /api/v1/auth/me
//@access    private

module.exports.getMe = asyncHandle( async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

//@desc      Forgot password
//@route     POST /api/v1/auth/forgotpassword
//@access    private

module.exports.forgotPassword = asyncHandle( async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email});

  if(!user) {
    return next(new ErrorResponse(`There is no user with email: ${req.body.email}`, 404));
  }

  //Get reset token
  const resetToken = user.getResetPasswordToken();
  
  await user.save({
    validateBeforeSave: false
  });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `Click to ${resetUrl} to reset password`;

  try {
    await sendMail({
      email: user.email,
      subejct: 'Reset password',
      message
    });

    res.status(200).json({
      success: true,
      data: 'Email sent'
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({
      validateBeforeSave: false
    });

    return next(new ErrorResponse(`Email coult not be sent`, 500));
  }

});