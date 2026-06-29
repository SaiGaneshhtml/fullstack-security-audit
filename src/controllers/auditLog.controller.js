const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { auditLogService } = require('../services');

const getAuditLogs = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['action', 'status', 'user']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  
  // Set default sorting by createdAt descending if not specified
  if (!options.sortBy) {
    options.sortBy = 'createdAt:desc';
  }

  const result = await auditLogService.queryAuditLogs(filter, options);
  res.send(result);
});

module.exports = {
  getAuditLogs,
};
