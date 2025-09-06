// Vercel Serverless Function - Webhook Only
module.exports = async function handler(req, res) {
  console.log('=== Webhook Called ===');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers));
  console.log('Body:', JSON.stringify(req.body));
  
  // Accept any request for now to pass LINE verification
  if (req.method === 'POST') {
    try {
      const events = req.body?.events || [];
      
      // Log events
      console.log('Events:', JSON.stringify(events));
      console.log('N8N_WEBHOOK_URL:', process.env.N8N_WEBHOOK_URL ? 'Set' : 'Not set');
      
      // If n8n webhook URL exists and we have events, forward them
      if (process.env.N8N_WEBHOOK_URL && events.length > 0) {
        console.log('Forwarding to n8n (fire-and-forget)');
        
        // Fire and forget - don't wait for response
        fetch(process.env.N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(req.body)
        }).catch(err => {
          // Log error but don't block
          console.error('n8n forward error (non-blocking):', err.message);
        });
        
        console.log('Forwarded to n8n, not waiting for response');
      } else {
        console.log('Not forwarding:', {
          hasUrl: !!process.env.N8N_WEBHOOK_URL,
          eventsLength: events.length
        });
      }
      
      // Always return 200 OK to LINE
      return res.status(200).json({ status: 'ok' });
    } catch (error) {
      console.error('Error processing webhook:', error);
      // Still return 200 to prevent LINE retry
      return res.status(200).json({ status: 'ok', error: error.message });
    }
  }
  
  // For non-POST requests
  return res.status(200).json({ 
    status: 'ok',
    message: 'Health Buddy Webhook',
    method: req.method 
  });
};