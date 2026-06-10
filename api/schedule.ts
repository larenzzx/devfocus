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
    const { subscriptionId, seconds, title, message } = req.body || {};

    if (!subscriptionId || !seconds) {
      return res.status(400).json({ error: 'Missing required parameters: subscriptionId, seconds' });
    }

    const appId = process.env.ONESIGNAL_APP_ID || "fb88458d-29aa-47c2-ba1c-ab3c117132fe";
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'ONESIGNAL_REST_API_KEY is not configured on the server' });
    }

    // Calculate time in future
    const sendAfterDate = new Date(Date.now() + seconds * 1000);
    // ISO format is supported by OneSignal
    const sendAfterStr = sendAfterDate.toISOString();

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${apiKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        include_subscription_ids: [subscriptionId],
        headings: { en: title || 'DevFocus Alert' },
        contents: { en: message || 'Your session is complete!' },
        send_after: sendAfterStr,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.errors || 'OneSignal API error' });
    }

    return res.status(200).json({ notificationId: data.id });
  } catch (error: any) {
    console.error('Error scheduling notification:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
