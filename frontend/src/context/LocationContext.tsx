import React, { createContext, useState, useContext } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface LocationData {
  coords: LocationCoords;
  address?: string;
}

interface LocationContextType {
  location: LocationData | null;
  getCurrentLocation: () => Promise<LocationData | null>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useState<LocationData | null>(null);

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      // Demander la permission de localisation
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'La permission d\'accéder à la localisation est nécessaire pour trouver les alertes près de chez vous.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Obtenir la position actuelle
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocoding pour obtenir l'adresse
      let address = '';
      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        if (geocode.length > 0) {
          const place = geocode[0];
          address = `${place.street || ''} ${place.city || ''} ${place.region || ''} ${place.country || ''}`.trim();
        }
      } catch (geocodeError) {
        console.warn('Erreur geocoding:', geocodeError);
      }

      const locationData: LocationData = {
        coords: {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        },
        address: address || 'Localisation actuelle'
      };

      setLocation(locationData);
      console.log('📍 Localisation obtenue:', locationData);
      
      return locationData;
    } catch (error) {
      console.error('Erreur obtention localisation:', error);
      
      // Fallback: utiliser une position par défaut (Yaoundé, Cameroun)
      const defaultLocation: LocationData = {
        coords: {
          latitude: 3.8480,
          longitude: 11.5021,
        },
        address: 'Yaoundé, Cameroun'
      };
      
      setLocation(defaultLocation);
      Alert.alert(
        'Localisation',
        'Utilisation de la position par défaut (Yaoundé). Activez la localisation pour une meilleure précision.',
        [{ text: 'OK' }]
      );
      
      return defaultLocation;
    }
  };

  const value: LocationContextType = {
    location,
    getCurrentLocation
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};