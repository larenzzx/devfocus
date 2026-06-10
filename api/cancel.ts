export default async function handler(req: any, res: any) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { notificationId } = req.body || {};

    if (!notificationId) {
      return res.status(400).json({ error: 'Missing required parameter: notificationId' });
    }

    const appId = process.env.ONESIGNAL_APP_ID || "fb88458d-29aa-47c2-ba1c-ab3c117132fe";
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'ONESIGNAL_REST_API_KEY is not configured on the server' });
    }

    const response = await fetch(`https://onesignal.com/api/v1/notifications/${notificationId}?app_id=${appId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${apiKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.errors || 'OneSignal API error' });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error cancelling notification:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
