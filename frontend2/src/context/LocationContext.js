import React, { createContext, useState, useContext } from 'react';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);

  const getCurrentLocation = async () => {
    // Simulation de localisation (Paris par défaut)
    const mockLocation = {
      coords: {
        latitude: 48.8566,
        longitude: 2.3522,
      },
      address: 'Paris, France'
    };
    setLocation(mockLocation);
    return mockLocation;
  };

  const value = {
    location,
    getCurrentLocation
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};