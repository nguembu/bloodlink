import API from './api';

// Version simulée pour le développement avec tokens persistants
let mockUsers = [];
let mockAlerts = [];

export const authService = {
  login: (email, password) => {
    return new Promise((resolve, reject) => {
      if(email && password) {
        try {
          const response = API.post('/auth/login', { email, password });
          user = {
            _id: Date.now().toString(),
            email: response.data.email,
            name: response.data.name,
            role: response.data.role,
            bloodType: response.data.bloodType || null,
            hospital: response.data.hospital || null,
            createdAt: new Date()
          }
          mockUsers.push(user);

          const token = response.token;

          resolve({
            data: {
              status: 'success',
              token: token,
              data: {
                user: user
              }
            }
          });
        } catch(error) {
          reject(new Error('Une erreur est survenue lors de la connexion'));
        }
      } else {
        reject(new Error('Email et mot de passe requis'));
      }
    })
  },

  register: (userData) => {
  return new Promise((resolve, reject) => {
    if (userData.email && userData.password) {
      try {
        const response = API.post('/auth/register', userData);

        const user = {
          _id: Date.now().toString(),
          email: userData.email,
          name: response.data.name || (userData.role === 'doctor' 
              ? 'Dr. ' + userData.email.split('@')[0] 
              : userData.email.split('@')[0]),
          role: response.data.role || userData.role,
          bloodType: response.data.bloodType || userData.bloodType || null,
          hospital: response.data.hospital || userData.hospital || null,
          phone: response.data.phone || userData.phone || null,
          createdAt: new Date()
        };

        mockUsers.push(user);

        const token = response.token;

        resolve({
          data: {
            status: 'success',
            token: token,
            data: {
              user: user
            }
          }
        });
      } catch (error) {
        reject(new Error("Une erreur est survenue lors de l'inscription"));
      }
    } else {
      reject(new Error("Email et mot de passe requis"));
    }
  });
},


  getProfile: async () => {
    try {
      const response = await API.get('/auth/profile'); 
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await API.put('/auth/profile', profileData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateLocation: async (locationData) => {
    try {
      const response = await API.post('/auth/location', locationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateFCMToken: async (fcmToken) => {
    try {
      const response = await API.post('/auth/fcm-token', { fcmToken });
      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await API.post('/auth/logout');
      return response;
    } catch (error) {
      throw error;
    }
  }
};