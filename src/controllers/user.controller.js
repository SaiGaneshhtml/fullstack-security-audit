const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, auditLogService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    await auditLogService.createAuditLog({
      action: 'USER_CREATE',
      user: req.user ? req.user._id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { createdUserId: user._id, createdUserEmail: user.email },
    });
    res.status(httpStatus.CREATED).send(user);
  } catch (error) {
    await auditLogService.createAuditLog({
      action: 'USER_CREATE',
      user: req.user ? req.user._id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'FAILED',
      details: { email: req.body.email, error: error.message },
    });
    throw error;
  }
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  try {
    const user = await userService.updateUserById(req.params.userId, req.body);
    await auditLogService.createAuditLog({
      action: 'USER_UPDATE',
      user: req.user ? req.user._id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { updatedUserId: req.params.userId, fieldsUpdated: Object.keys(req.body) },
    });
    res.send(user);
  } catch (error) {
    await auditLogService.createAuditLog({
      action: 'USER_UPDATE',
      user: req.user ? req.user._id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'FAILED',
      details: { updatedUserId: req.params.userId, error: error.message },
    });
    throw error;
  }
});

const deleteUser = catchAsync(async (req, res) => {
  try {
    await userService.deleteUserById(req.params.userId);
    await auditLogService.createAuditLog({
      action: 'USER_DELETE',
      user: req.user ? req.user._id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { deletedUserId: req.params.userId },
    });
    res.status(httpStatus.NO_CONTENT).send();
  } catch (error) {
    await auditLogService.createAuditLog({
      action: 'USER_DELETE',
      user: req.user ? req.user._id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'FAILED',
      details: { deletedUserId: req.params.userId, error: error.message },
    });
    throw error;
  }
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
