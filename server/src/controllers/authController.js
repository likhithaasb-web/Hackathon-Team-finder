import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken } from '../utils/token.js';
import { sendEmail } from '../utils/email.js';

export const register = async (req, res, next) => {
  try {
    const { fullName, username, email, password, roleTitle, college, skills } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
      return res.status(409).json({
        success: false,
        message: `An account with this ${field} already exists.`,
      });
    }

    const user = await User.create({
      fullName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      roleTitle: roleTitle || 'Developer',
      college: college || '',
      skills: Array.isArray(skills) ? skills : [],
      isOnline: true,
      lastSeen: new Date(),
    });

    const token = generateToken(user._id, user.role);

    // Remove password from response
    const userJson = user.toObject();
    delete userJson.password;

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to HackMate.',
      token,
      user: userJson,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact platform administrators.',
      });
    }

    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);
    const userJson = user.toObject();
    delete userJson.password;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userJson,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'fullName', 'bio', 'roleTitle', 'college', 'degree', 'department',
      'yearOfStudy', 'location', 'timeZone', 'skills', 'programmingLanguages',
      'frameworksAndTools', 'interests', 'preferredHackathonCategories',
      'experienceLevel', 'previousHackathons', 'preferredRoles', 'availability',
      'collaborationMode', 'lookingForTeam', 'communicationLanguage',
      'portfolioUrl', 'githubUrl', 'linkedinUrl', 'twitterUrl', 'avatarUrl',
      'privacy', 'notificationPreferences',
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't leak user existence for security
      return res.status(200).json({
        success: true,
        message: 'If that email address is registered, password reset instructions have been sent.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const message = `
      <h3>HackMate Password Reset</h3>
      <p>Hello ${user.fullName},</p>
      <p>You requested a password reset for your HackMate account. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}" style="background:#4F46E5;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Reset Password</a></p>
      <p>Or paste this URL in your browser: ${resetUrl}</p>
      <p>This link expires in 60 minutes.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Reset your HackMate password',
      html: message,
      text: `Reset your password at: ${resetUrl}`,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset instructions have been sent.',
      // For smooth demo testing in local environments:
      demoResetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired.',
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const authToken = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You are now logged in.',
      token: authToken,
      user: user.toObject(),
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Your current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        isOnline: false,
        lastSeen: new Date(),
      });
    }
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};
