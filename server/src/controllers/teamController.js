import crypto from 'crypto';
import Team from '../models/Team.js';
import Hackathon from '../models/Hackathon.js';
import TeamApplication from '../models/TeamApplication.js';
import TeamInvitation from '../models/TeamInvitation.js';
import Conversation from '../models/Conversation.js';
import Notification from '../models/Notification.js';
import ProjectActivity from '../models/ProjectActivity.js';
import User from '../models/User.js';
import { getIO } from '../sockets/socketManager.js';

export const createTeam = async (req, res, next) => {
  try {
    const {
      name,
      description,
      hackathon,
      problemStatement,
      techStack,
      requiredSkills,
      openPositions,
      desiredSize,
      collaborationMode,
      availabilityRequirements,
      applicationDeadline,
      visibility,
      rules,
      repoUrl,
      meetingLink,
    } = req.body;

    // Check name uniqueness
    const existing = await Team.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A team with this name already exists.' });
    }

    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const team = await Team.create({
      name: name.trim(),
      description,
      hackathon,
      problemStatement: problemStatement || '',
      techStack: techStack || [],
      requiredSkills: requiredSkills || [],
      openPositions: openPositions || [],
      desiredSize: desiredSize || 4,
      collaborationMode: collaborationMode || 'Remote',
      availabilityRequirements: availabilityRequirements || '10-15 hrs/week',
      applicationDeadline: applicationDeadline || undefined,
      visibility: visibility || 'public',
      rules: rules || 'Be respectful, commit daily, join sync meetings.',
      repoUrl: repoUrl || '',
      meetingLink: meetingLink || '',
      leader: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'Team Lead',
          joinedAt: new Date(),
        },
      ],
      inviteCode,
      inviteCodeExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    // Create group conversation for the team
    await Conversation.create({
      type: 'team',
      participants: [req.user._id],
      team: team._id,
    });

    // Log activity
    await ProjectActivity.create({
      team: team._id,
      user: req.user._id,
      action: 'Team Created',
      details: `${req.user.fullName} initialized the team "${team.name}".`,
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('leader', 'fullName username avatarUrl roleTitle')
      .populate('members.user', 'fullName username avatarUrl roleTitle skills')
      .populate('hackathon', 'title bannerUrl startDate endDate registrationDeadline');

    res.status(201).json({
      success: true,
      message: 'Team created successfully!',
      team: populatedTeam,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeams = async (req, res, next) => {
  try {
    const {
      search,
      hackathon,
      recruitmentStatus,
      collaborationMode,
      skill,
      role,
      theme,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { visibility: 'public' };

    if (hackathon) query.hackathon = hackathon;
    if (recruitmentStatus && recruitmentStatus !== 'all') query.recruitmentStatus = recruitmentStatus;
    if (collaborationMode && collaborationMode !== 'all') query.collaborationMode = collaborationMode;

    if (role && role !== 'all' && role !== 'All Roles') {
      const roleRegex = new RegExp(role.trim(), 'i');
      query.$or = [
        { 'openPositions.role': roleRegex },
        { requiredSkills: roleRegex },
      ];
    }

    if (theme && theme !== 'all' && theme !== 'All Themes') {
      const matchingHackathons = await Hackathon.find({
        themes: { $in: [new RegExp(theme.trim(), 'i')] },
      }).select('_id');
      const hackathonIds = matchingHackathons.map(h => h._id);
      query.hackathon = { $in: hackathonIds };
    }

    if (skill) {
      const skillsArray = skill.split(',').map(s => s.trim());
      query.requiredSkills = { $in: skillsArray.map(s => new RegExp(`^${s}$`, 'i')) };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const searchConditions = [
        { name: searchRegex },
        { description: searchRegex },
        { problemStatement: searchRegex },
        { techStack: searchRegex },
        { requiredSkills: searchRegex },
        { 'openPositions.role': searchRegex },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Team.countDocuments(query);
    const teams = await Team.find(query)
      .populate('leader', 'fullName username avatarUrl roleTitle')
      .populate('members.user', 'fullName username avatarUrl roleTitle')
      .populate('hackathon', 'title bannerUrl startDate endDate registrationDeadline format')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      teams,
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

export const getMyTeams = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const teams = await Team.find({
      'members.user': userId,
    })
      .populate('leader', 'fullName username avatarUrl roleTitle')
      .populate('members.user', 'fullName username avatarUrl roleTitle skills isOnline')
      .populate('hackathon', 'title bannerUrl startDate endDate registrationDeadline')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      teams,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader', 'fullName username avatarUrl roleTitle bio college githubUrl linkedinUrl')
      .populate('members.user', 'fullName username avatarUrl roleTitle bio college skills githubUrl linkedinUrl isOnline lastSeen')
      .populate('hackathon');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    // Check user membership status
    let userRole = null;
    let hasApplied = false;
    let pendingInvite = false;

    if (req.user) {
      const isMember = team.members.find(m => m.user._id.toString() === req.user._id.toString());
      if (isMember) {
        userRole = isMember.role;
      } else {
        const app = await TeamApplication.findOne({
          team: team._id,
          applicant: req.user._id,
          status: 'pending',
        });
        hasApplied = !!app;

        const inv = await TeamInvitation.findOne({
          team: team._id,
          invitee: req.user._id,
          status: 'pending',
        });
        pendingInvite = !!inv;
      }
    }

    // Fetch team activity log
    const activities = await ProjectActivity.find({ team: team._id })
      .populate('user', 'fullName username avatarUrl')
      .sort({ createdAt: -1 })
      .limit(20);

    // Fetch team conversation ID if member
    let conversationId = null;
    if (userRole) {
      const conv = await Conversation.findOne({ team: team._id, type: 'team' });
      if (conv) conversationId = conv._id;
    }

    res.status(200).json({
      success: true,
      team,
      userRole,
      hasApplied,
      pendingInvite,
      activities,
      conversationId,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only team leaders can modify team details.' });
    }

    const updated = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('leader', 'fullName username avatarUrl roleTitle')
      .populate('members.user', 'fullName username avatarUrl roleTitle skills')
      .populate('hackathon');

    await ProjectActivity.create({
      team: team._id,
      user: req.user._id,
      action: 'Team Details Updated',
      details: `${req.user.fullName} updated the team settings.`,
    });

    res.status(200).json({
      success: true,
      message: 'Team updated successfully.',
      team: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const applyToTeam = async (req, res, next) => {
  try {
    const { id } = req.params; // team id
    const { position, message } = req.body;
    const applicantId = req.user._id;

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

    if (team.recruitmentStatus === 'closed') {
      return res.status(400).json({ success: false, message: 'This team has closed recruitment.' });
    }

    if (team.members.length >= team.desiredSize) {
      return res.status(400).json({ success: false, message: 'This team is already at full capacity.' });
    }

    const isMember = team.members.some(m => m.user.toString() === applicantId.toString());
    if (isMember) {
      return res.status(400).json({ success: false, message: 'You are already a member of this team.' });
    }

    const existingApp = await TeamApplication.findOne({
      team: id,
      applicant: applicantId,
      status: 'pending',
    });

    if (existingApp) {
      return res.status(400).json({ success: false, message: 'You have already submitted an application to this team.' });
    }

    const application = await TeamApplication.create({
      team: id,
      applicant: applicantId,
      position: position || 'Member',
      message: message || '',
    });

    // Notify team leader
    const notification = await Notification.create({
      recipient: team.leader,
      sender: applicantId,
      type: 'application_received',
      title: 'New Team Application',
      message: `${req.user.fullName} applied to join ${team.name} as ${position || 'Member'}.`,
      data: { teamId: team._id, applicationId: application._id },
    });

    try {
      const io = getIO();
      io.to(`user:${team.leader}`).emit('notification', notification);
    } catch {}

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! The team leader will review your request.',
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamApplications = async (req, res, next) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only team leaders can view applications.' });
    }

    const applications = await TeamApplication.find({ team: id, status: 'pending' })
      .populate('applicant', 'fullName username avatarUrl roleTitle bio skills college experienceLevel githubUrl linkedinUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

export const respondToApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { action } = req.body; // 'accept' | 'reject'

    const application = await TeamApplication.findById(applicationId)
      .populate('team')
      .populate('applicant', 'fullName email');

    if (!application || application.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Application not found or already processed.' });
    }

    const team = await Team.findById(application.team._id);
    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only team leaders can respond to applications.' });
    }

    if (action === 'accept') {
      // Atomic capacity check
      if (team.members.length >= team.desiredSize) {
        return res.status(400).json({ success: false, message: 'Cannot accept: team is already full!' });
      }

      application.status = 'accepted';
      application.reviewedBy = req.user._id;
      await application.save();

      // Push member
      team.members.push({
        user: application.applicant._id,
        role: application.position || 'Member',
        joinedAt: new Date(),
      });

      // If team reaches capacity, automatically close recruitment
      if (team.members.length >= team.desiredSize) {
        team.recruitmentStatus = 'closed';
      }

      await team.save();

      // Add to team conversation
      await Conversation.findOneAndUpdate(
        { team: team._id, type: 'team' },
        { $addToSet: { participants: application.applicant._id } }
      );

      // Activity log
      await ProjectActivity.create({
        team: team._id,
        user: req.user._id,
        action: 'Member Joined',
        details: `${application.applicant.fullName} joined the team as ${application.position || 'Member'}.`,
      });

      // Notification
      const notification = await Notification.create({
        recipient: application.applicant._id,
        sender: req.user._id,
        type: 'application_accepted',
        title: 'Application Accepted! 🎉',
        message: `Congratulations! You have been accepted into "${team.name}". Welcome aboard!`,
        data: { teamId: team._id },
      });

      try {
        const io = getIO();
        io.to(`user:${application.applicant._id}`).emit('notification', notification);
        io.to(`team:${team._id}`).emit('team_updated', { teamId: team._id, action: 'member_joined' });
      } catch {}

      return res.status(200).json({
        success: true,
        message: `${application.applicant.fullName} has been added to the team!`,
      });
    } else if (action === 'reject') {
      application.status = 'rejected';
      application.reviewedBy = req.user._id;
      await application.save();

      const notification = await Notification.create({
        recipient: application.applicant._id,
        sender: req.user._id,
        type: 'application_rejected',
        title: 'Team Application Update',
        message: `Your application to join "${team.name}" was not selected. Don't worry, many more opportunities await!`,
        data: { teamId: team._id },
      });

      try {
        const io = getIO();
        io.to(`user:${application.applicant._id}`).emit('notification', notification);
      } catch {}

      return res.status(200).json({
        success: true,
        message: 'Application declined.',
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action.' });
    }
  } catch (error) {
    next(error);
  }
};

export const inviteUserToTeam = async (req, res, next) => {
  try {
    const { id } = req.params; // team id
    const { userId, position, message } = req.body;

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only team leaders can invite new members.' });
    }

    if (team.members.length >= team.desiredSize) {
      return res.status(400).json({ success: false, message: 'Team is already at maximum capacity.' });
    }

    const isMember = team.members.some(m => m.user.toString() === userId.toString());
    if (isMember) {
      return res.status(400).json({ success: false, message: 'This user is already on the team.' });
    }

    const invitation = await TeamInvitation.create({
      team: id,
      inviter: req.user._id,
      invitee: userId,
      position: position || 'Member',
      message: message || '',
    });

    const notification = await Notification.create({
      recipient: userId,
      sender: req.user._id,
      type: 'team_invitation',
      title: 'Team Invitation Received! 🚀',
      message: `${req.user.fullName} invited you to join their team "${team.name}" as ${position || 'Member'}.`,
      data: { teamId: team._id, invitationId: invitation._id },
    });

    try {
      const io = getIO();
      io.to(`user:${userId}`).emit('notification', notification);
    } catch {}

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully.',
      invitation,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyInvitations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const invitations = await TeamInvitation.find({
      invitee: userId,
      status: 'pending',
    })
      .populate('team', 'name description logoUrl desiredSize members hackathon')
      .populate('inviter', 'fullName username avatarUrl roleTitle')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      invitations,
    });
  } catch (error) {
    next(error);
  }
};

export const respondToInvite = async (req, res, next) => {
  try {
    const { invitationId } = req.params;
    const { action } = req.body; // 'accept' | 'reject'
    const userId = req.user._id;

    const invitation = await TeamInvitation.findOne({
      _id: invitationId,
      invitee: userId,
      status: 'pending',
    }).populate('team');

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found or expired.' });
    }

    const team = await Team.findById(invitation.team._id);

    if (action === 'accept') {
      if (team.members.length >= team.desiredSize) {
        return res.status(400).json({ success: false, message: 'Team has already reached full capacity.' });
      }

      invitation.status = 'accepted';
      await invitation.save();

      team.members.push({
        user: userId,
        role: invitation.position || 'Member',
        joinedAt: new Date(),
      });

      if (team.members.length >= team.desiredSize) {
        team.recruitmentStatus = 'closed';
      }
      await team.save();

      // Add to team conversation
      await Conversation.findOneAndUpdate(
        { team: team._id, type: 'team' },
        { $addToSet: { participants: userId } }
      );

      // Activity log
      await ProjectActivity.create({
        team: team._id,
        user: userId,
        action: 'Member Joined via Invite',
        details: `${req.user.fullName} accepted the team invitation.`,
      });

      // Notify leader
      const notif = await Notification.create({
        recipient: team.leader,
        sender: userId,
        type: 'invitation_accepted',
        title: 'Invitation Accepted!',
        message: `${req.user.fullName} accepted your invitation to join ${team.name}!`,
        data: { teamId: team._id },
      });

      try {
        const io = getIO();
        io.to(`user:${team.leader}`).emit('notification', notif);
      } catch {}

      return res.status(200).json({
        success: true,
        message: `You have successfully joined "${team.name}"!`,
      });
    } else if (action === 'reject') {
      invitation.status = 'rejected';
      await invitation.save();

      return res.status(200).json({
        success: true,
        message: 'Invitation declined.',
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action.' });
    }
  } catch (error) {
    next(error);
  }
};

export const joinByInviteCode = async (req, res, next) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    const team = await Team.findOne({
      inviteCode: code.toUpperCase().trim(),
    });

    if (!team) {
      return res.status(404).json({ success: false, message: 'Invalid invite code.' });
    }

    if (team.inviteCodeExpires && team.inviteCodeExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'This invite code has expired.' });
    }

    if (team.members.length >= team.desiredSize) {
      return res.status(400).json({ success: false, message: 'This team is already full.' });
    }

    const isMember = team.members.some(m => m.user.toString() === userId.toString());
    if (isMember) {
      return res.status(400).json({ success: false, message: 'You are already a member of this team.' });
    }

    team.members.push({
      user: userId,
      role: 'Member',
      joinedAt: new Date(),
    });

    if (team.members.length >= team.desiredSize) {
      team.recruitmentStatus = 'closed';
    }
    await team.save();

    await Conversation.findOneAndUpdate(
      { team: team._id, type: 'team' },
      { $addToSet: { participants: userId } }
    );

    await ProjectActivity.create({
      team: team._id,
      user: userId,
      action: 'Joined via Code',
      details: `${req.user.fullName} joined the team using a shareable invite code.`,
    });

    res.status(200).json({
      success: true,
      message: `Successfully joined ${team.name}!`,
      teamId: team._id,
    });
  } catch (error) {
    next(error);
  }
};

export const leaveTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

    if (team.leader.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Team leaders cannot leave without transferring ownership first.',
      });
    }

    team.members = team.members.filter(m => m.user.toString() !== userId.toString());
    if (team.members.length < team.desiredSize) {
      team.recruitmentStatus = 'open';
    }
    await team.save();

    await Conversation.findOneAndUpdate(
      { team: team._id, type: 'team' },
      { $pull: { participants: userId } }
    );

    await ProjectActivity.create({
      team: team._id,
      user: userId,
      action: 'Member Left',
      details: `${req.user.fullName} left the team.`,
    });

    res.status(200).json({
      success: true,
      message: 'You have left the team.',
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { id, memberId } = req.params;
    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only team leaders can remove members.' });
    }

    if (memberId === team.leader.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot remove team leader.' });
    }

    const removedUser = await User.findById(memberId);

    team.members = team.members.filter(m => m.user.toString() !== memberId);
    if (team.members.length < team.desiredSize) {
      team.recruitmentStatus = 'open';
    }
    await team.save();

    await Conversation.findOneAndUpdate(
      { team: team._id, type: 'team' },
      { $pull: { participants: memberId } }
    );

    await ProjectActivity.create({
      team: team._id,
      user: req.user._id,
      action: 'Member Removed',
      details: `${req.user.fullName} removed ${removedUser ? removedUser.fullName : 'a member'} from the team.`,
    });

    res.status(200).json({
      success: true,
      message: 'Member removed from team.',
    });
  } catch (error) {
    next(error);
  }
};

export const transferOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newLeaderId } = req.body;

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only current team leader can transfer ownership.' });
    }

    const isMember = team.members.some(m => m.user.toString() === newLeaderId.toString());
    if (!isMember) {
      return res.status(400).json({ success: false, message: 'New leader must be an existing team member.' });
    }

    team.leader = newLeaderId;
    team.members = team.members.map(m => {
      if (m.user.toString() === newLeaderId.toString()) {
        return { ...m.toObject(), role: 'Team Lead' };
      }
      if (m.user.toString() === req.user._id.toString()) {
        return { ...m.toObject(), role: 'Member' };
      }
      return m;
    });

    await team.save();

    const newLeader = await User.findById(newLeaderId);
    await ProjectActivity.create({
      team: team._id,
      user: req.user._id,
      action: 'Ownership Transferred',
      details: `Team ownership transferred to ${newLeader ? newLeader.fullName : 'new leader'}.`,
    });

    res.status(200).json({
      success: true,
      message: 'Team leadership transferred successfully.',
      team,
    });
  } catch (error) {
    next(error);
  }
};
