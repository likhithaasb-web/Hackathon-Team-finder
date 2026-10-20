import mongoose from 'mongoose';

const teamApplicationSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    default: '',
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

teamApplicationSchema.index({ team: 1, applicant: 1, status: 1 });
teamApplicationSchema.index({ applicant: 1 });
teamApplicationSchema.index({ team: 1 });

export default mongoose.model('TeamApplication', teamApplicationSchema);
