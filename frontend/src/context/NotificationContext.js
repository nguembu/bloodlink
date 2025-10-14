import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(null);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const { user, isAuthenticated } = useAuth();

  // Configuration des notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  const registerForPushNotifications = async () => {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'bloodlink-alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    setExpoPushToken(token);

    // Envoyer le token au backend
    if (isAuthenticated && token) {
      try {
        await notificationService.updateFCMToken(token);
        console.log('FCM token sent to backend');
      } catch (error) {
        console.error('Error sending FCM token to backend:', error);
      }
    }

    return token;
  };

  const schedulePushNotification = async (title, body, data = {}) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        priority: 'high',
      },
      trigger: null, // Immédiat
    });
  };

  const loadNotificationHistory = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await notificationService.getHistory();
      setNotificationHistory(response.data.data.notifications || []);
    } catch (error) {
      console.error('Error loading notification history:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotificationHistory(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    registerForPushNotifications();
    loadNotificationHistory();

    // Écouter les notifications reçues
    const notificationReceivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      // Recharger l'historique quand une nouvelle notification arrive
      loadNotificationHistory();
    });

    // Écouter les interactions avec les notifications
    const notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('Notification interaction:', data);
      
      // Vous pouvez gérer la navigation ici basée sur les données de la notification
      // Par exemple: navigation.navigate(data.screen, { alertId: data.alertId })
    });

    return () => {
      notificationReceivedSubscription.remove();
      notificationResponseSubscription.remove();
    };
  }, [isAuthenticated]);

  const value = {
    expoPushToken,
    notification,
    notificationHistory,
    registerForPushNotifications,
    schedulePushNotification,
    loadNotificationHistory,
    markAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};