import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const previousHackathonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  year: { type: Number },
  prize: { type: String, default: '' },
  description: { type: String, default: '' },
}, { _id: false });

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  roleTitle: {
    type: String,
    default: 'Developer',
    trim: true,
  },
  college: {
    type: String,
    default: '',
    trim: true,
  },
  department: {
    type: String,
    default: '',
    trim: true,
  },
  degree: {
    type: String,
    default: '',
    trim: true,
  },
  yearOfStudy: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
    trim: true,
  },
  timeZone: {
    type: String,
    default: 'UTC',
  },
  bio: {
    type: String,
    default: '',
    maxlength: [500, 'Bio cannot exceed 500 characters'],
  },
  skills: [{
    type: String,
    trim: true,
  }],
  programmingLanguages: [{
    type: String,
    trim: true,
  }],
  frameworksAndTools: [{
    type: String,
    trim: true,
  }],
  interests: [{
    type: String,
    trim: true,
  }],
  preferredHackathonCategories: [{
    type: String,
    trim: true,
  }],
  experienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate',
  },
  previousHackathons: [previousHackathonSchema],
  preferredRoles: [{
    type: String,
    trim: true,
  }],
  availability: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Weekends only', 'Flexible'],
    default: 'Flexible',
  },
  collaborationMode: {
    type: String,
    enum: ['Remote', 'In-person', 'Hybrid'],
    default: 'Remote',
  },
  lookingForTeam: {
    type: Boolean,
    default: true,
  },
  communicationLanguage: {
    type: String,
    default: 'English',
  },
  portfolioUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  twitterUrl: { type: String, default: '' },
  isVerified: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active',
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'connections_only'],
      default: 'public',
    },
    showOnlineStatus: {
      type: Boolean,
      default: true,
    },
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
    teamInvites: { type: Boolean, default: true },
    chat: { type: Boolean, default: true },
  },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Profile completion percentage virtual
userSchema.virtual('profileCompleteness').get(function () {
  let score = 0;
  if (this.fullName) score += 10;
  if (this.bio) score += 10;
  if (this.avatarUrl) score += 10;
  if (this.college) score += 10;
  if (this.skills && this.skills.length > 0) score += 20;
  if (this.preferredRoles && this.preferredRoles.length > 0) score += 10;
  if (this.githubUrl || this.portfolioUrl) score += 15;
  if (this.interests && this.interests.length > 0) score += 10;
  if (this.location) score += 5;
  return Math.min(score, 100);
});

// Password hash hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password verification method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes
userSchema.index({ skills: 1 });
userSchema.index({ lookingForTeam: 1 });
userSchema.index({ roleTitle: 1 });
userSchema.index({ fullName: 'text', skills: 'text', bio: 'text', college: 'text' });

export default mongoose.model('User', userSchema);
