import mongoose from 'mongoose';

const openPositionSchema = new mongoose.Schema({
  role: { type: String, required: true },
  requiredSkills: [{ type: String }],
  description: { type: String, default: '' },
  filled: { type: Boolean, default: false },
});

const teamMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    default: 'Member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: { type: Date },
  completed: { type: Boolean, default: false },
});

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    unique: true,
    trim: true,
  },
  logoUrl: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    required: [true, 'Team description is required'],
  },
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: [true, 'Associated hackathon is required'],
  },
  problemStatement: {
    type: String,
    default: '',
  },
  techStack: [{
    type: String,
    trim: true,
  }],
  requiredSkills: [{
    type: String,
    trim: true,
  }],
  openPositions: [openPositionSchema],
  desiredSize: {
    type: Number,
    default: 4,
    min: [2, 'Team must have at least 2 members'],
    max: [10, 'Team size cannot exceed 10'],
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [teamMemberSchema],
  collaborationMode: {
    type: String,
    enum: ['Remote', 'In-person', 'Hybrid'],
    default: 'Remote',
  },
  availabilityRequirements: {
    type: String,
    default: '10-15 hrs/week during hackathon sprint',
  },
  applicationDeadline: {
    type: Date,
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
  recruitmentStatus: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  rules: {
    type: String,
    default: 'Be respectful, commit daily, join sync meetings.',
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  inviteCodeExpires: {
    type: Date,
  },
  repoUrl: {
    type: String,
    default: '',
  },
  meetingLink: {
    type: String,
    default: '',
  },
  milestones: [milestoneSchema],
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

teamSchema.index({ hackathon: 1 });
teamSchema.index({ leader: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ recruitmentStatus: 1 });
teamSchema.index({ name: 'text', description: 'text', problemStatement: 'text' });

export default mongoose.model('Team', teamSchema);
