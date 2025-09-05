// Simple test endpoint
module.exports = async function handler(req, res) {
  console.log('Test endpoint called');
  console.log('Method:', req.method);
  console.log('Env vars exist:', {
    hasSecret: !!process.env.LINE_CHANNEL_SECRET,
    hasN8N: !!process.env.N8N_WEBHOOK_URL
  });
  
  return res.status(200).json({ 
    status: 'ok',
    method: req.method,
    timestamp: new Date().toISOString(),
    env: {
      hasLineSecret: !!process.env.LINE_CHANNEL_SECRET,
      hasN8nUrl: !!process.env.N8N_WEBHOOK_URL
    }
  });
};