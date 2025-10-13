/**
 * Utilitaires pour les calculs géographiques
 */

// Calcul de la distance entre deux points en km (formule Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

const toRad = (value) => {
  return value * Math.PI / 180;
};

// Trouve les utilisateurs dans un rayon donné
const findUsersInRadius = async (UserModel, centerLat, centerLon, radiusKm, bloodType = null) => {
  try {
    // Construction de la requête
    let query = {
      role: 'donor',
      isActive: true,
      location: {
        $exists: true,
        $ne: null
      }
    };

    // Filtre par type sanguin si spécifié
    if (bloodType) {
      query.bloodType = bloodType;
    }

    const allDonors = await UserModel.find(query);
    
    // Filtrage manuel par distance
    const donorsInRadius = allDonors.filter(donor => {
      if (!donor.location || !donor.location.coordinates) return false;
      
      const [donorLon, donorLat] = donor.location.coordinates;
      const distance = calculateDistance(centerLat, centerLon, donorLat, donorLon);
      
      return distance <= radiusKm;
    });

    return donorsInRadius;
  } catch (error) {
    console.error('Error finding users in radius:', error);
    throw error;
  }
};

// Vérifie si un point est dans le rayon
const isInRadius = (centerLat, centerLon, pointLat, pointLon, radiusKm) => {
  const distance = calculateDistance(centerLat, centerLon, pointLat, pointLon);
  return distance <= radiusKm;
};

// Convertit les degrés en radians
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Génère une bounding box pour les requêtes géospatiales approximatives
const getBoundingBox = (lat, lon, radiusKm) => {
  const earthRadius = 6371; // km
  const latDelta = (radiusKm / earthRadius) * (180 / Math.PI);
  const lonDelta = (radiusKm / earthRadius) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta
  };
};

module.exports = {
  calculateDistance,
  findUsersInRadius,
  isInRadius,
  deg2rad,
  getBoundingBox
};