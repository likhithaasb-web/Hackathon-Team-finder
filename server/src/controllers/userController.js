import User from '../models/User.js';
import Connection from '../models/Connection.js';
import Bookmark from '../models/Bookmark.js';
import Team from '../models/Team.js';
import { calculateUserCompatibility } from '../utils/matchingAlgorithm.js';

export const getUsers = async (req, res, next) => {
  try {
    const {
      search,
      skill,
      role,
      experienceLevel,
      college,
      location,
      collaborationMode,
      lookingForTeam,
      sort = 'relevance',
      page = 1,
      limit = 12,
    } = req.query;

    const query = { status: 'active' };

    // Don't show current logged in user in teammate search
    if (req.user) {
      query._id = { $ne: req.user._id };
    }

    // Filter by looking for team
    if (lookingForTeam !== undefined) {
      query.lookingForTeam = lookingForTeam === 'true';
    }

    // Role filter
    if (role && role !== 'all') {
      query.preferredRoles = { $regex: new RegExp(role, 'i') };
    }

    // Experience filter
    if (experienceLevel && experienceLevel !== 'all') {
      query.experienceLevel = experienceLevel;
    }

    // Collaboration mode
    if (collaborationMode && collaborationMode !== 'all') {
      query.collaborationMode = collaborationMode;
    }

    // College filter
    if (college) {
      query.college = { $regex: new RegExp(college, 'i') };
    }

    // Location filter
    if (location) {
      query.location = { $regex: new RegExp(location, 'i') };
    }

    // Skill filter
    if (skill) {
      const skillsArray = skill.split(',').map(s => s.trim());
      query.skills = { $in: skillsArray.map(s => new RegExp(`^${s}$`, 'i')) };
    }

    // Search query across name, username, bio, skills, college
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { fullName: searchRegex },
        { username: searchRegex },
        { bio: searchRegex },
        { skills: searchRegex },
        { college: searchRegex },
        { roleTitle: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Determine sort
    let sortOption = { isOnline: -1, lastSeen: -1 };
    if (sort === 'recently_active') {
      sortOption = { lastSeen: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordResetToken -passwordResetExpires')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Enrich with connection status & bookmarks & compatibility if user is authenticated
    let connectionMap = new Map();
    let bookmarkSet = new Set();

    if (req.user) {
      const connections = await Connection.find({
        $or: [
          { requester: req.user._id, recipient: { $in: users.map(u => u._id) } },
          { recipient: req.user._id, requester: { $in: users.map(u => u._id) } },
        ],
      });

      for (const conn of connections) {
        const isRequester = conn.requester.toString() === req.user._id.toString();
        const otherId = isRequester ? conn.recipient.toString() : conn.requester.toString();
        connectionMap.set(otherId, {
          status: conn.status,
          isRequester,
          connectionId: conn._id,
        });
      }

      const bookmarks = await Bookmark.find({
        user: req.user._id,
        itemType: 'user',
        itemId: { $in: users.map(u => u._id) },
      });
      bookmarkSet = new Set(bookmarks.map(b => b.itemId.toString()));
    }

    const enrichedUsers = users.map(u => {
      const compatibility = req.user ? calculateUserCompatibility(req.user, u) : null;
      return {
        ...u,
        compatibility,
        connectionStatus: connectionMap.get(u._id.toString()) || { status: 'none' },
        isBookmarked: bookmarkSet.has(u._id.toString()),
      };
    });

    // If sorting by relevance and current user is logged in, sort by compatibility score
    if (sort === 'relevance' && req.user) {
      enrichedUsers.sort((a, b) => (b.compatibility?.score || 0) - (a.compatibility?.score || 0));
    }

    res.status(200).json({
      success: true,
      users: enrichedUsers,
      pagination: {
        total: totalUsers,
        page: pageNum,
        pages: Math.ceil(totalUsers / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserRecommendations = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const candidates = await User.find({
      _id: { $ne: currentUser._id },
      status: 'active',
      lookingForTeam: true,
    })
      .select('-passwordResetToken -passwordResetExpires')
      .limit(30)
      .lean();

    const scored = candidates.map(candidate => {
      const match = calculateUserCompatibility(currentUser, candidate);
      return {
        ...candidate,
        compatibility: match,
      };
    });

    scored.sort((a, b) => b.compatibility.score - a.compatibility.score);

    res.status(200).json({
      success: true,
      recommendations: scored.slice(0, 6),
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordResetToken -passwordResetExpires');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let connectionStatus = { status: 'none' };
    let isBookmarked = false;
    let compatibility = null;

    if (req.user) {
      compatibility = calculateUserCompatibility(req.user, user);

      const connection = await Connection.findOne({
        $or: [
          { requester: req.user._id, recipient: user._id },
          { recipient: req.user._id, requester: user._id },
        ],
      });

      if (connection) {
        connectionStatus = {
          status: connection.status,
          isRequester: connection.requester.toString() === req.user._id.toString(),
          connectionId: connection._id,
        };
      }

      const bookmark = await Bookmark.findOne({
        user: req.user._id,
        itemType: 'user',
        itemId: user._id,
      });
      isBookmarked = !!bookmark;
    }

    // Also fetch teams user belongs to
    const userTeams = await Team.find({
      'members.user': user._id,
    }).populate('hackathon', 'title bannerUrl startDate endDate');

    res.status(200).json({
      success: true,
      user,
      teams: userTeams,
      connectionStatus,
      isBookmarked,
      compatibility,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserByUsername = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() })
      .select('-passwordResetToken -passwordResetExpires');

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

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Remove user connections, bookmarks, applications
    await Connection.deleteMany({ $or: [{ requester: userId }, { recipient: userId }] });
    await Bookmark.deleteMany({ user: userId });
    
    // Remove from team memberships
    await Team.updateMany(
      { 'members.user': userId },
      { $pull: { members: { user: userId } } }
    );

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
