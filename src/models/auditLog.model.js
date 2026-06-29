const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const auditLogSchema = mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: false,
    },
    ipAddress: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      required: true,
      index: true,
    },
    details: {
      type: mongoose.SchemaTypes.Mixed,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
auditLogSchema.plugin(toJSON);
auditLogSchema.plugin(paginate);

/**
 * @typedef AuditLog
 */
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
