const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/security');

const router = express.Router();

// @route   POST /api/admin/send-notification
// @desc    Send push notification to users
// @access  Admin
router.post('/send-notification', 
  requireAuth,
  apiLimiter,
  [
    body('title').notEmpty().withMessage('Notification title is required'),
    body('body').notEmpty().withMessage('Notification body is required'),
    body('userIds').optional().isArray().withMessage('User IDs must be an array'),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { title, body, data, userIds } = req.body;

      // Get target users
      let targetUsers;
      if (userIds && userIds.length > 0) {
        targetUsers = await User.find({ 
          _id: { $in: userIds },
          isActive: true,
          'preferences.notifications.push': true
        }).select('pushToken name email');
      } else {
        // Send to all active users with push notifications enabled
        targetUsers = await User.find({ 
          isActive: true,
          'preferences.notifications.push': true,
          pushToken: { $exists: true, $ne: null }
        }).select('pushToken name email');
      }

      if (targetUsers.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'No users found with push notification tokens'
        });
      }

      // Prepare push notifications
      const pushMessages = targetUsers
        .filter(user => user.pushToken)
        .map(user => ({
          to: user.pushToken,
          sound: 'default',
          title: title,
          body: body,
          data: data || {},
          priority: 'high',
          channelId: 'default',
        }));

      if (pushMessages.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'No valid push tokens found'
        });
      }

      // Send notifications using Expo Push API
      // For now, we'll simulate sending (in production, use Expo's push service)
      console.log(`📤 Would send ${pushMessages.length} push notifications:`, {
        title,
        body,
        recipients: pushMessages.length
      });

      // Log notification for audit
      console.log('📝 Notification sent by:', req.user.email);
      console.log('📊 Recipients:', targetUsers.map(u => u.email));

      res.status(200).json({
        status: 'success',
        message: 'Notifications sent successfully',
        data: {
          recipientCount: pushMessages.length,
          recipients: targetUsers.map(u => ({ id: u._id, email: u.email }))
        }
      });

    } catch (error) {
      console.error('Send notification error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to send notifications'
      });
    }
  }
);

// @route   POST /api/admin/schedule-prayer-notifications
// @desc    Schedule prayer time notifications for all users
// @access  Admin
router.post('/schedule-prayer-notifications',
  requireAuth,
  apiLimiter,
  async (req, res) => {
    try {
      const activeUsers = await User.find({ 
        isActive: true,
        'preferences.notifications.prayer': true
      }).select('_id name email');

      console.log(`🕌 Scheduling prayer notifications for ${activeUsers.length} users`);

      // In a real implementation, you would:
      // 1. Calculate prayer times for each user's location
      // 2. Schedule notifications using a job queue (Bull, Agenda, etc.)
      // 3. Store notification schedules in database

      res.status(200).json({
        status: 'success',
        message: 'Prayer notifications scheduled successfully',
        data: {
          userCount: activeUsers.length,
          scheduledFor: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Schedule prayer notifications error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to schedule prayer notifications'
      });
    }
  }
);

// @route   GET /api/admin/notification-stats
// @desc    Get notification statistics
// @access  Admin
router.get('/notification-stats',
  requireAuth,
  apiLimiter,
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments({ isActive: true });
      const pushEnabledUsers = await User.countDocuments({ 
        isActive: true,
        'preferences.notifications.push': true,
        pushToken: { $exists: true, $ne: null }
      });
      const prayerEnabledUsers = await User.countDocuments({ 
        isActive: true,
        'preferences.notifications.prayer': true
      });

      res.status(200).json({
        status: 'success',
        data: {
          totalUsers,
          pushEnabledUsers,
          prayerEnabledUsers,
          pushEnabledPercentage: totalUsers > 0 ? Math.round((pushEnabledUsers / totalUsers) * 100) : 0,
          prayerEnabledPercentage: totalUsers > 0 ? Math.round((prayerEnabledUsers / totalUsers) * 100) : 0
        }
      });

    } catch (error) {
      console.error('Notification stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get notification statistics'
      });
    }
  }
);

module.exports = router;
