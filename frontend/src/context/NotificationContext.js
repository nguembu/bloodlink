import React, { createContext, useContext } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const schedulePushNotification = async (title, body) => {
    console.log('Notification:', title, body);
    // Implémentation réelle à ajouter plus tard
  };

  const value = {
    schedulePushNotification,
    expoPushToken: 'mock-token'
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};