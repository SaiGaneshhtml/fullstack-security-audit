const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getAuditLogs = {
  query: Joi.object().keys({
    action: Joi.string(),
    status: Joi.string().valid('SUCCESS', 'FAILED'),
    user: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  getAuditLogs,
};
