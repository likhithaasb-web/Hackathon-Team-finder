import mongoose from 'mongoose';

const teamInvitationSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  inviter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  invitee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  position: {
    type: String,
    default: 'Member',
  },
  message: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

teamInvitationSchema.index({ team: 1, invitee: 1, status: 1 });
teamInvitationSchema.index({ invitee: 1, status: 1 });

export default mongoose.model('TeamInvitation', teamInvitationSchema);
