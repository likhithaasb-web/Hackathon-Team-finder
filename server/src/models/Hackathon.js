import mongoose from 'mongoose';

const prizeItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: String, default: '' },
  description: { type: String, default: '' },
}, { _id: false });

const hackathonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Hackathon title is required'],
    trim: true,
  },
  bannerUrl: {
    type: String,
    default: '',
  },
  organizer: {
    type: String,
    required: [true, 'Organizer name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  themes: [{
    type: String,
    trim: true,
  }],
  eligibility: {
    type: String,
    default: 'Open to all students and developers worldwide',
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required'],
  },
  minTeamSize: {
    type: Number,
    default: 1,
  },
  maxTeamSize: {
    type: Number,
    default: 4,
  },
  format: {
    type: String,
    enum: ['Online', 'In-person', 'Hybrid'],
    default: 'Online',
  },
  location: {
    type: String,
    default: 'Global (Virtual)',
  },
  prizePool: {
    type: String,
    default: '$10,000',
  },
  prizes: [prizeItemSchema],
  requiredTechnologies: [{
    type: String,
    trim: true,
  }],
  officialUrl: {
    type: String,
    default: '',
  },
  contactEmail: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'archived'],
    default: 'upcoming',
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

hackathonSchema.index({ status: 1 });
hackathonSchema.index({ registrationDeadline: 1 });
hackathonSchema.index({ themes: 1 });
hackathonSchema.index({ title: 'text', description: 'text', organizer: 'text' });

export default mongoose.model('Hackathon', hackathonSchema);
