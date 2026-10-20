import Bookmark from '../models/Bookmark.js';
import User from '../models/User.js';
import Team from '../models/Team.js';
import Hackathon from '../models/Hackathon.js';

export const getBookmarks = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const bookmarks = await Bookmark.find({ user: userId }).sort({ createdAt: -1 });

    const userIds = bookmarks.filter(b => b.itemType === 'user').map(b => b.itemId);
    const teamIds = bookmarks.filter(b => b.itemType === 'team').map(b => b.itemId);
    const hackathonIds = bookmarks.filter(b => b.itemType === 'hackathon').map(b => b.itemId);

    const [users, teams, hackathons] = await Promise.all([
      User.find({ _id: { $in: userIds } }).select('fullName username avatarUrl roleTitle skills college experienceLevel lookingForTeam'),
      Team.find({ _id: { $in: teamIds } }).populate('hackathon', 'title').populate('leader', 'fullName'),
      Hackathon.find({ _id: { $in: hackathonIds } }),
    ]);

    res.status(200).json({
      success: true,
      bookmarks: {
        users,
        teams,
        hackathons,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleBookmark = async (req, res, next) => {
  try {
    const { itemType, itemId } = req.body;
    const userId = req.user._id;

    if (!['user', 'team', 'hackathon'].includes(itemType)) {
      return res.status(400).json({ success: false, message: 'Invalid item type.' });
    }

    const existing = await Bookmark.findOne({ user: userId, itemType, itemId });

    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      return res.status(200).json({
        success: true,
        isBookmarked: false,
        message: 'Removed from bookmarks.',
      });
    }

    await Bookmark.create({
      user: userId,
      itemType,
      itemId,
    });

    res.status(201).json({
      success: true,
      isBookmarked: true,
      message: 'Saved to bookmarks!',
    });
  } catch (error) {
    next(error);
  }
};
