// app/api/pusher/trigger/route.js
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: "2046854",
  key: "39e929ae966aeeea6ca3", 
  secret: "d3729a93045287b3e17b",
  cluster: "us2",
  useTLS: true
});

export async function POST(request) {
  try {
    const { channel, event, data } = await request.json();
    
    console.log(`Triggering event: ${event} on channel: ${channel}`);
    
    await pusher.trigger(channel, event, data);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Pusher trigger error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}