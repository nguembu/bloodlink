const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/donors', require('./routes/donors'));
app.use('/api/bloodbanks', require('./routes/bloodBanks'));

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'BloodLink API is running!',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée.'
  });
});

// Connexion à la base de données
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bloodlink';

// Ajoutez des options de connexion
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ Connecté à la base de données MongoDB');
    console.log('📊 Base de données:', mongoose.connection.db.databaseName);
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur BloodLink démarré sur le port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
    console.log('💡 URI utilisée:', MONGO_URI);
    process.exit(1);
  });

module.exports = app;