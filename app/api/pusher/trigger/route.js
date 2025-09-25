// app/api/pusher/trigger/route.js - للـ App Directory في Next.js 15
import Pusher from 'pusher';
import { NextResponse } from 'next/server';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { channel, event, data } = body;

    console.log('🔔 Pusher Trigger:', { channel, event, data });

    await pusher.trigger(channel, event, data);
    
    console.log('✅ Pusher event sent successfully');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Pusher trigger error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger event', details: error.message }, 
      { status: 500 }
    );
  }
}

// إضافة دعم لباقي HTTP methods إذا احتجنا
export async function GET() {
  return NextResponse.json({ message: 'Pusher API is working!' });
}