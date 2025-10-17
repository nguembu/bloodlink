// tests/notificationController.test.js
const notificationController = require('../controllers/notificationController');
const notificationUtils = require('../utils/notification');

jest.mock('../utils/notification');

describe('Notification Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 'userId' },
      params: {},
      body: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  // -----------------------------
  // getMyNotifications
  // -----------------------------
  describe('getMyNotifications', () => {
    test('should return notifications successfully', async () => {
      const fakeNotifications = [
        { id: 'notif1', message: 'Test notification' }
      ];
      notificationUtils.getNotificationHistory.mockResolvedValue(fakeNotifications);

      await notificationController.getMyNotifications(req, res);

      expect(notificationUtils.getNotificationHistory).toHaveBeenCalledWith('userId');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 1,
        data: { notifications: fakeNotifications }
      });
    });

    test('should handle errors', async () => {
      const error = new Error('Database error');
      notificationUtils.getNotificationHistory.mockRejectedValue(error);

      await notificationController.getMyNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Erreur lors de la récupération des notifications'
      });
    });
  });

  // -----------------------------
  // markNotificationAsRead
  // -----------------------------
  describe('markNotificationAsRead', () => {
    test('should mark notification as read successfully', async () => {
      req.params.id = 'notif1';
      notificationUtils.markAsRead.mockResolvedValue(true);

      await notificationController.markNotificationAsRead(req, res);

      expect(notificationUtils.markAsRead).toHaveBeenCalledWith('notif1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Notification marquée comme lue'
      });
    });

    test('should return 404 if notification not found', async () => {
      req.params.id = 'notif1';
      notificationUtils.markAsRead.mockResolvedValue(false);

      await notificationController.markNotificationAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Notification non trouvée'
      });
    });

    test('should handle errors', async () => {
      const error = new Error('DB error');
      notificationUtils.markAsRead.mockRejectedValue(error);

      await notificationController.markNotificationAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Erreur lors de la mise à jour de la notification'
      });
    });
  });

  // -----------------------------
  // updateMyFCMToken
  // -----------------------------
  describe('updateMyFCMToken', () => {
    test('should update FCM token successfully', async () => {
      req.body.fcmToken = 'token123';
      notificationUtils.updateFCMToken.mockResolvedValue(true);

      await notificationController.updateMyFCMToken(req, res);

      expect(notificationUtils.updateFCMToken).toHaveBeenCalledWith('userId', 'token123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Token FCM mis à jour avec succès'
      });
    });

    test('should return 400 if FCM token is missing', async () => {
      req.body.fcmToken = null;

      await notificationController.updateMyFCMToken(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Token FCM requis'
      });
    });

    test('should return 500 if update fails', async () => {
      req.body.fcmToken = 'token123';
      notificationUtils.updateFCMToken.mockResolvedValue(false);

      await notificationController.updateMyFCMToken(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Erreur lors de la mise à jour du token FCM'
      });
    });

    test('should handle errors', async () => {
      req.body.fcmToken = 'token123';
      const error = new Error('DB error');
      notificationUtils.updateFCMToken.mockRejectedValue(error);

      await notificationController.updateMyFCMToken(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Erreur lors de la mise à jour du token FCM'
      });
    });
  });
});
