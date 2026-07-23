/**
 * Send Expo push notifications (https://docs.expo.dev/push-notifications/sending-notifications/)
 */
async function sendExpoPushMessages(messages) {
  const list = (Array.isArray(messages) ? messages : [messages]).filter(
    (m) => m && m.to && typeof m.to === 'string'
  );
  if (list.length === 0) {
    return { ok: false, sent: 0, reason: 'no_tokens' };
  }

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        list.map((m) => ({
          to: m.to,
          title: m.title,
          body: m.body,
          data: m.data || {},
          sound: m.sound || 'default',
          priority: 'high',
          channelId: m.channelId || 'default',
        }))
      ),
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      console.warn('Expo push failed:', response.status, result);
      return { ok: false, sent: 0, result };
    }
    return { ok: true, sent: list.length, result };
  } catch (error) {
    console.warn('Expo push error:', error.message);
    return { ok: false, sent: 0, error: error.message };
  }
}

async function sendPushToUser(user, { title, body, data }) {
  if (!user?.pushToken) {
    return { ok: false, sent: 0, reason: 'no_token' };
  }
  return sendExpoPushMessages([
    {
      to: user.pushToken,
      title,
      body,
      data: data || {},
    },
  ]);
}

module.exports = {
  sendExpoPushMessages,
  sendPushToUser,
};
