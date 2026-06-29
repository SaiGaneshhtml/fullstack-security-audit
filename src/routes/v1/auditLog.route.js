const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { auditLogValidation } = require('../../validations');
const { auditLogController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .get(auth('getAuditLogs'), validate(auditLogValidation.getAuditLogs), auditLogController.getAuditLogs);

module.exports = router;
