import Report from '../models/Report.js';

export const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, details } = req.body;

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason,
      details: details || '',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your report. Our moderation team will review this promptly.',
      report,
    });
  } catch (error) {
    next(error);
  }
};
