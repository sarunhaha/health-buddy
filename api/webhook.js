// Vercel Serverless Function - Webhook Only
const crypto = require('crypto');

// Validate LINE signature
function validateSignature(body, signature, channelSecret) {
  if (!channelSecret) {
    console.error('Missing LINE_CHANNEL_SECRET');
    return false;
  }
  
  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');
  
  return hash === signature;
}

module.exports = async function handler(req, res) {
  // Log for debugging
  console.log('Webhook called:', req.method);
  console.log('Headers:', req.headers);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get signature and body
    const signature = req.headers['x-line-signature'];
    const body = JSON.stringify(req.body);
    
    // Check environment variables
    if (!process.env.LINE_CHANNEL_SECRET) {
      console.error('LINE_CHANNEL_SECRET is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    // Validate signature
    if (!validateSignature(body, signature, process.env.LINE_CHANNEL_SECRET)) {
      console.error('Invalid signature');
      return res.status(403).json({ error: 'Invalid signature' });
    }

    // If n8n webhook URL exists, forward the request
    if (process.env.N8N_WEBHOOK_URL) {
      const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Line-Signature': signature
        },
        body: body
      });

      if (!n8nResponse.ok) {
        console.error(`n8n error: ${n8nResponse.status}`);
      }
    }

    // Always return 200 to LINE
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    // Return 200 even on error to prevent LINE retry
    return res.status(200).json({ status: 'ok', error: error.message });
  }
};