import { NextRequest, NextResponse } from 'next/server';
import { verifySignature, handlePullRequestEvent } from '@/features/webhooks/github';

export async function POST(request: NextRequest) {
  const secret = process.env.WEBHOOK_SECRET;
  
  if (!secret) {
    console.error('[Webhook] WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const signature = request.headers.get('x-hub-signature-256');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  const body = await request.text();
  
  try {
    const isValid = await verifySignature(secret, body, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const event = request.headers.get('x-github-event');

    if (event === 'pull_request') {
      await handlePullRequestEvent(payload);
    } else {
      console.log(`[Webhook] Unsupported event type: ${event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Webhook] Processing error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
