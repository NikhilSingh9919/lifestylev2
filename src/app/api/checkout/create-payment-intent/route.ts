import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const { amount, currency = 'gbp', metadata = {} } = await req.json();

    const apiKey = process.env.STRIPE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'STRIPE_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(apiKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Payment intent creation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
