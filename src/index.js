require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { middleware } = require('@line/bot-sdk');
const logger = require('./utils/logger');
const { sequelize } = require('./models');
// const cronJobs = require('./services/cronJobs'); // Commented out - file doesn't exist

const app = express();
const PORT = process.env.PORT || 3000;

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

app.use(helmet());
app.use(cors());

app.use('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/webhook', middleware(lineConfig), require('./api/webhook'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', require('./api/users'));
app.use('/api/reports', require('./api/reports'));
app.use('/api/health-logs', require('./api/healthLogs'));
app.use('/api/reminders', require('./api/reminders'));

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    await sequelize.sync({ alter: true });
    logger.info('Database synchronized');
    
    // cronJobs.initializeJobs(); // Commented out - file doesn't exist
    // logger.info('Cron jobs initialized');
    
    app.listen(PORT, () => {
      logger.info(`Health Buddy server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});