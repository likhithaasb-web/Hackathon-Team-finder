import express from 'express';
import {
  createTeam,
  getTeams,
  getMyTeams,
  getTeamById,
  updateTeam,
  applyToTeam,
  getTeamApplications,
  respondToApplication,
  inviteUserToTeam,
  getMyInvitations,
  respondToInvite,
  joinByInviteCode,
  leaveTeam,
  removeMember,
  transferOwnership,
} from '../controllers/teamController.js';
import { protect, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalProtect, getTeams);
router.get('/my-teams', protect, getMyTeams);
router.get('/my-invitations', protect, getMyInvitations);
router.post('/join-code', protect, joinByInviteCode);
router.get('/:id', optionalProtect, getTeamById);
router.post('/', protect, createTeam);
router.put('/:id', protect, updateTeam);
router.post('/:id/apply', protect, applyToTeam);
router.get('/:id/applications', protect, getTeamApplications);
router.put('/applications/:applicationId', protect, respondToApplication);
router.post('/:id/invite', protect, inviteUserToTeam);
router.put('/invitations/:invitationId', protect, respondToInvite);
router.post('/:id/leave', protect, leaveTeam);
router.delete('/:id/members/:memberId', protect, removeMember);
router.put('/:id/transfer', protect, transferOwnership);

export default router;
