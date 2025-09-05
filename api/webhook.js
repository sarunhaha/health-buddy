// Vercel Serverless Function - Webhook Only
import { validateSignature } from '../src/utils/lineValidator';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate LINE signature
    const signature = req.headers['x-line-signature'];
    const body = JSON.stringify(req.body);
    
    if (!validateSignature(body, signature, process.env.LINE_CHANNEL_SECRET)) {
      return res.status(403).json({ error: 'Invalid signature' });
    }

    // Forward to n8n webhook for processing
    const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Line-Signature': signature
      },
      body: body
    });

    if (!n8nResponse.ok) {
      throw new Error(`n8n error: ${n8nResponse.status}`);
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}