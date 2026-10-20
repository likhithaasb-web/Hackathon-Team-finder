import express from 'express';
import {
  getStats,
  getAdminUsers,
  updateUserStatus,
  getAdminReports,
  resolveReport,
  getAuditLogs,
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/stats', getStats);
router.get('/users', getAdminUsers);
router.put('/users/:userId/status', updateUserStatus);
router.get('/reports', getAdminReports);
router.put('/reports/:reportId/resolve', resolveReport);
router.get('/audit-logs', getAuditLogs);

export default router;
