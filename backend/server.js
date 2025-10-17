// server.js
const setupSwagger = require('./config/swagger');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const compression = require('compression');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();

// ------------------- 🔒 Sécurité globale -------------------
app.use(helmet());
app.use(xss());
app.use(compression());
app.use(express.json({ limit: '10kb' }));

//swagger
setupSwagger(app);

// ------------------- 🌍 CORS -------------------
app.use(
  cors({
    origin: ['http://localhost:3000', 'exp://localhost:19000'],
    credentials: true,
  })
);

// ------------------- 📈 Logs -------------------
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ------------------- 🚦 Limiteur de requêtes -------------------
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: 'Trop de requêtes depuis cette IP, réessayez plus tard.',
});
app.use('/api', limiter);

// ------------------- 📚 Swagger Configuration -------------------
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BloodLink API',
      version: '1.0.0',
      description:
        'Documentation de l’API BloodLink — permet aux médecins et donneurs de gérer les alertes de sang.',
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 5000}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js', './controllers/*.js'], // fichiers scannés
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ------------------- 🧭 Routes principales -------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/donors', require('./routes/donors'));

// ------------------- 🩸 Health Check -------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'BloodLink API is running!',
    timestamp: new Date().toISOString(),
  });
});

// ------------------- 🚫 Routes non trouvées -------------------
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
});

// ------------------- 💥 Gestion globale des erreurs -------------------
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ------------------- 🔗 Connexion à MongoDB -------------------
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) =>
      console.error('MongoDB connection error:', err)
    );
    mongoose.connection.on('disconnected', () =>
      console.log('⚠️ MongoDB disconnected')
    );
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// ------------------- 🚀 Démarrage du serveur -------------------
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 BloodLink Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Swagger Docs: http://localhost:${PORT}/api-docs`);
      console.log(`🩸 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// ------------------- 🧹 Fermeture propre -------------------
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed.');
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// ------------------- 🧪 Export pour tests -------------------
module.exports = app;

if (require.main === module) {
  startServer();
}
