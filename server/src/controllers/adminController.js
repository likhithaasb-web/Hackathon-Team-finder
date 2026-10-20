import User from '../models/User.js';
import Team from '../models/Team.js';
import Hackathon from '../models/Hackathon.js';
import Report from '../models/Report.js';
import AuditLog from '../models/AuditLog.js';

export const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalTeams,
      totalHackathons,
      pendingReports,
      teamsWithOpenings,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isOnline: true }),
      Team.countDocuments(),
      Hackathon.countDocuments({ status: { $ne: 'archived' } }),
      Report.countDocuments({ status: 'pending' }),
      Team.countDocuments({ recruitmentStatus: 'open' }),
    ]);

    // Calculate total unfilled positions
    const openTeams = await Team.find({ recruitmentStatus: 'open' }, 'openPositions desiredSize members');
    let openPositionsCount = 0;
    openTeams.forEach(t => {
      const unfilled = (t.openPositions || []).filter(p => !p.filled).length;
      const capacityRemaining = Math.max(0, (t.desiredSize || 4) - (t.members || []).length);
      openPositionsCount += Math.max(unfilled, capacityRemaining);
    });

    // Recent user signups for trends (last 7 days grouped)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSignups = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent teams created
    const recentTeams = await Team.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalTeams,
        totalHackathons,
        pendingReports,
        openPositionsCount,
        openTeamsCount: teamsWithOpenings,
        userTrends: recentSignups.map(r => ({ date: r._id, users: r.count })),
        teamTrends: recentTeams.map(r => ({ date: r._id, teams: r.count })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.status = status;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ fullName: regex }, { username: regex }, { email: regex }, { college: regex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status, role } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Protect self from accidental lockout
    if (user._id.toString() === req.user._id.toString() && status === 'suspended') {
      return res.status(400).json({ success: false, message: 'Cannot suspend your own admin account.' });
    }

    if (status) user.status = status;
    if (role) user.role = role;
    await user.save();

    await AuditLog.create({
      admin: req.user._id,
      action: 'User Status Updated',
      targetType: 'User',
      targetId: user._id,
      details: { updatedStatus: status, updatedRole: role },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `User ${user.fullName} updated successfully.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminReports = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const reports = await Report.find(query)
      .populate('reporter', 'fullName username avatarUrl email')
      .populate('resolvedBy', 'fullName username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

export const resolveReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { status, resolutionNotes } = req.body;

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

    report.status = status || 'resolved';
    report.resolutionNotes = resolutionNotes || '';
    report.resolvedBy = req.user._id;
    await report.save();

    await AuditLog.create({
      admin: req.user._id,
      action: 'Report Resolved',
      targetType: 'Report',
      targetId: report._id,
      details: { status: report.status, notes: resolutionNotes },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Report status updated.',
      report,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('admin', 'fullName username email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    next(error);
  }
};
