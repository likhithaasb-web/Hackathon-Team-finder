import Hackathon from '../models/Hackathon.js';
import Team from '../models/Team.js';
import Bookmark from '../models/Bookmark.js';

export const getHackathons = async (req, res, next) => {
  try {
    const {
      search,
      format,
      status,
      theme,
      page = 1,
      limit = 10,
      sort = 'deadline',
    } = req.query;

    const query = { status: { $ne: 'archived' } };

    if (format && format !== 'all') {
      query.format = format;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (theme && theme !== 'all') {
      query.themes = { $in: [new RegExp(theme, 'i')] };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { organizer: searchRegex },
        { description: searchRegex },
        { themes: searchRegex },
        { location: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    let sortOption = { registrationDeadline: 1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'start_date') sortOption = { startDate: 1 };

    const total = await Hackathon.countDocuments(query);
    const hackathons = await Hackathon.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Check if user has bookmarked any
    let bookmarkedIds = new Set();
    if (req.user) {
      const bookmarks = await Bookmark.find({
        user: req.user._id,
        itemType: 'hackathon',
        itemId: { $in: hackathons.map(h => h._id) },
      });
      bookmarkedIds = new Set(bookmarks.map(b => b.itemId.toString()));
    }

    const enriched = hackathons.map(h => ({
      ...h,
      isBookmarked: bookmarkedIds.has(h._id.toString()),
    }));

    res.status(200).json({
      success: true,
      hackathons: enriched,
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

export const getFeaturedHackathons = async (req, res, next) => {
  try {
    const featured = await Hackathon.find({
      status: { $in: ['upcoming', 'ongoing'] },
      registrationDeadline: { $gte: new Date() },
    })
      .sort({ registrationDeadline: 1 })
      .limit(4)
      .lean();

    res.status(200).json({
      success: true,
      hackathons: featured,
    });
  } catch (error) {
    next(error);
  }
};

export const getHackathonById = async (req, res, next) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon listing not found.' });
    }

    // Teams created for this hackathon
    const teams = await Team.find({
      hackathon: hackathon._id,
    })
      .populate('leader', 'fullName username avatarUrl')
      .populate('members.user', 'fullName username avatarUrl roleTitle')
      .lean();

    let isBookmarked = false;
    if (req.user) {
      const bookmark = await Bookmark.findOne({
        user: req.user._id,
        itemType: 'hackathon',
        itemId: hackathon._id,
      });
      isBookmarked = !!bookmark;
    }

    res.status(200).json({
      success: true,
      hackathon,
      teams,
      isBookmarked,
    });
  } catch (error) {
    next(error);
  }
};

export const createHackathon = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdBy: req.user._id,
    };

    const hackathon = await Hackathon.create(data);

    res.status(201).json({
      success: true,
      message: 'Hackathon listing created successfully.',
      hackathon,
    });
  } catch (error) {
    next(error);
  }
};

export const updateHackathon = async (req, res, next) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found.' });
    }

    // Check ownership or admin
    if (hackathon.createdBy && hackathon.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this hackathon.' });
    }

    const updated = await Hackathon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Hackathon listing updated.',
      hackathon: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHackathon = async (req, res, next) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found.' });
    }

    if (hackathon.createdBy && hackathon.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this hackathon.' });
    }

    await Hackathon.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Hackathon listing removed.',
    });
  } catch (error) {
    next(error);
  }
};
