import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  targetType: {
    type: String,
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ admin: 1 });

export default mongoose.model('AuditLog', auditLogSchema);
