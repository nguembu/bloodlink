// Version simulée pour le développement avec tokens persistants
let mockUsers = [];
let mockAlerts = [];

export const authService = {
  login: (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          // Créer ou récupérer l'utilisateur
          let user = mockUsers.find(u => u.email === email);
          if (!user) {
            user = {
              _id: Date.now().toString(),
              email: email,
              name: email.includes('doctor') ? 'Dr. Test' : 'Donneur Test',
              role: email.includes('doctor') ? 'doctor' : 'donor',
              bloodType: email.includes('doctor') ? null : 'A+',
              hospital: email.includes('doctor') ? 'Hôpital Central' : null,
              createdAt: new Date()
            };
            mockUsers.push(user);
          }

          // Token valide 24 heures
          const token = `mock-jwt-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          resolve({
            data: {
              status: 'success',
              token: token,
              data: {
                user: user
              }
            }
          });
        } else {
          reject(new Error('Email et mot de passe requis'));
        }
      }, 1000);
    });
  },

  register: (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userData.email && userData.password) {
          const user = {
            _id: Date.now().toString(),
            email: userData.email,
            name: userData.name || (userData.role === 'doctor' ? 'Dr. ' + userData.email.split('@')[0] : userData.email.split('@')[0]),
            role: userData.role,
            bloodType: userData.bloodType || null,
            hospital: userData.hospital || null,
            phone: userData.phone || null,
            createdAt: new Date()
          };
          
          mockUsers.push(user);

          const token = `mock-jwt-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          resolve({
            data: {
              status: 'success',
              token: token,
              data: {
                user: user
              }
            }
          });
        } else {
          reject(new Error('Données manquantes'));
        }
      }, 1000);
    });
  },

  getProfile: () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simuler la récupération du profil depuis le token
        // En réalité, cela vérifierait le token côté backend
        const user = mockUsers[0]; // Premier utilisateur créé
        if (user) {
          resolve({
            data: {
              status: 'success',
              data: {
                user: user
              }
            }
          });
        } else {
          reject(new Error('Utilisateur non trouvé'));
        }
      }, 500);
    });
  },

  updateProfile: (profileData) => {
    return Promise.resolve({ data: { status: 'success' } });
  },

  updateLocation: (locationData) => {
    return Promise.resolve({ data: { status: 'success' } });
  },

  updateFCMToken: (fcmToken) => {
    return Promise.resolve({ data: { status: 'success' } });
  },

  logout: () => {
    return Promise.resolve();
  }
};