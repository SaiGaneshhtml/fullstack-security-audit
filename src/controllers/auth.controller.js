const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService, auditLogService } = require('../services');

const register = catchAsync(async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    const tokens = await tokenService.generateAuthTokens(user);
    await auditLogService.createAuditLog({
      action: 'REGISTER_SUCCESS',
      user: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { email: user.email },
    });
    res.status(httpStatus.CREATED).send({ user, tokens });
  } catch (error) {
    await auditLogService.createAuditLog({
      action: 'REGISTER_FAILED',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'FAILED',
      details: { email: req.body.email, error: error.message },
    });
    throw error;
  }
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authService.loginUserWithEmailAndPassword(email, password);
    const tokens = await tokenService.generateAuthTokens(user);
    await auditLogService.createAuditLog({
      action: 'LOGIN_SUCCESS',
      user: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { email },
    });
    res.send({ user, tokens });
  } catch (error) {
    await auditLogService.createAuditLog({
      action: 'LOGIN_FAILED',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'FAILED',
      details: { email, error: error.message },
    });
    throw error;
  }
});

const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  let userId;
  try {
    const Token = require('../models/token.model');
    const { tokenTypes } = require('../config/tokens');
    const tokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
    if (tokenDoc) {
      userId = tokenDoc.user;
    }
  } catch (err) {}

  await authService.logout(refreshToken);

  await auditLogService.createAuditLog({
    action: 'LOGOUT',
    user: userId,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'SUCCESS',
  });

  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
