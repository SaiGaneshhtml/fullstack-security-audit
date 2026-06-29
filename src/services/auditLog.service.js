const { AuditLog } = require('../models');

/**
 * Create an audit log
 * @param {Object} logBody
 * @returns {Promise<AuditLog>}
 */
const createAuditLog = async (logBody) => {
  return AuditLog.create(logBody);
};

/**
 * Query for audit logs
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryAuditLogs = async (filter, options) => {
  // Populate the 'user' field with name and email, sorted by default by createdAt:desc
  const finalOptions = {
    ...options,
    populate: 'user',
  };
  const auditLogs = await AuditLog.paginate(filter, finalOptions);
  return auditLogs;
};

module.exports = {
  createAuditLog,
  queryAuditLogs,
};
