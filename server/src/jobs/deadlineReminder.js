import Hackathon from '../models/Hackathon.js';
import Bookmark from '../models/Bookmark.js';
import Notification from '../models/Notification.js';
import { getIO } from '../sockets/socketManager.js';

export const checkDeadlineReminders = async () => {
  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find hackathons whose registration deadline is between now and the next 24 hours
    const closingSoon = await Hackathon.find({
      status: { $in: ['upcoming', 'ongoing'] },
      registrationDeadline: { $gte: now, $lte: in24Hours },
    });

    for (const hackathon of closingSoon) {
      // Find all users who bookmarked this hackathon
      const bookmarks = await Bookmark.find({
        itemType: 'hackathon',
        itemId: hackathon._id,
      });

      for (const bookmark of bookmarks) {
        // Check if reminder notification already sent
        const alreadySent = await Notification.findOne({
          recipient: bookmark.user,
          type: 'hackathon_deadline',
          'data.hackathonId': hackathon._id,
        });

        if (!alreadySent) {
          const notification = await Notification.create({
            recipient: bookmark.user,
            type: 'hackathon_deadline',
            title: 'Hackathon Deadline Approaching! ⏳',
            message: `Registration for "${hackathon.title}" closes in less than 24 hours! Form your team now.`,
            data: { hackathonId: hackathon._id },
          });

          try {
            const io = getIO();
            io.to(`user:${bookmark.user}`).emit('notification', notification);
          } catch {}
        }
      }
    }
  } catch (error) {
    console.error('[Deadline Reminder Job Error]:', error.message);
  }
};

export const startDeadlineCron = () => {
  // Check on startup after 10 seconds, then every 30 minutes
  setTimeout(checkDeadlineReminders, 10000);
  setInterval(checkDeadlineReminders, 30 * 60 * 1000);
  console.log('[Scheduler] Deadline reminder background job scheduled.');
};
