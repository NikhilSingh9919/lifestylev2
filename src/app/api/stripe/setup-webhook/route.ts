import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const { url, events } = await req.json().catch(() => ({}));
    const apiKey = process.env.STRIPE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'STRIPE_API_KEY is not configured in .env' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(apiKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const targetUrl = url || `${protocol}://${host}/api/webhooks/stripe`;

    const webhookEndpoint = await stripe.webhookEndpoints.create({
      url: targetUrl,
      enabled_events: events || [
        'checkout.session.completed',
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'payment_intent.amount_capturable_updated',
        'charge.succeeded',
      ],
    });

    return NextResponse.json({
      success: true,
      endpointId: webhookEndpoint.id,
      url: webhookEndpoint.url,
      secret: webhookEndpoint.secret,
      message: 'Webhook created successfully in Stripe Dashboard.',
    });
  } catch (err: any) {
    console.error('Stripe webhook creation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
