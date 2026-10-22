import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').trim(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30).trim(),
  email: z.string().email('Please provide a valid email').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roleTitle: z.string().optional(),
  college: z.string().optional(),
  department: z.string().optional(),
  degree: z.string().optional(),
  yearOfStudy: z.string().optional(),
  location: z.string().optional(),
  experienceLevel: z.string().optional(),
  preferredRoles: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  preferredHackathonCategories: z.array(z.string()).optional(),
  availability: z.string().optional(),
  collaborationMode: z.string().optional(),
  bio: z.string().optional(),
  githubUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
}).passthrough();

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  roleTitle: z.string().optional(),
  college: z.string().optional(),
  degree: z.string().optional(),
  department: z.string().optional(),
  yearOfStudy: z.string().optional(),
  location: z.string().optional(),
  timeZone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  programmingLanguages: z.array(z.string()).optional(),
  frameworksAndTools: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  preferredHackathonCategories: z.array(z.string()).optional(),
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional(),
  preferredRoles: z.array(z.string()).optional(),
  availability: z.enum(['Full-time', 'Part-time', 'Weekends only', 'Flexible']).optional(),
  collaborationMode: z.enum(['Remote', 'In-person', 'Hybrid']).optional(),
  lookingForTeam: z.boolean().optional(),
  communicationLanguage: z.string().optional(),
  portfolioUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'connections_only']).optional(),
    showOnlineStatus: z.boolean().optional(),
  }).optional(),
  notificationPreferences: z.object({
    email: z.boolean().optional(),
    inApp: z.boolean().optional(),
    teamInvites: z.boolean().optional(),
    chat: z.boolean().optional(),
  }).optional(),
});

export const validateRequest = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    const errorDetails = error.errors ? error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ') : error.message;
    return res.status(400).json({
      success: false,
      message: errorDetails || 'Invalid request parameters',
      errors: error.errors,
    });
  }
};
