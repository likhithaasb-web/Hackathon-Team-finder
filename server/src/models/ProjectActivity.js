import mongoose from 'mongoose';

const projectActivitySchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

projectActivitySchema.index({ team: 1, createdAt: -1 });

export default mongoose.model('ProjectActivity', projectActivitySchema);
