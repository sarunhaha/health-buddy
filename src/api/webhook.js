const express = require('express');
const router = express.Router();
const lineService = require('../services/line/messageHandler');
const logger = require('../utils/logger');

router.post('/', async (req, res) => {
  try {
    const events = req.body.events;
    
    if (!events || events.length === 0) {
      return res.status(200).json({ status: 'ok' });
    }
    
    await Promise.all(events.map(async (event) => {
      try {
        await lineService.handleEvent(event);
      } catch (err) {
        logger.error(`Error handling event: ${err.message}`, { event });
      }
    }));
    
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;