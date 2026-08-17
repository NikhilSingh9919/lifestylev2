import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const { items, customerEmail, cartId, returnUrl } = await req.json();

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

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = returnUrl || `${protocol}://${host}`;

    const line_items = (items || []).map((item: any) => {
      const unitAmount = Math.round(parseFloat(item.price || '0') * 100);
      return {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: item.title,
            images: item.imageUrl && item.imageUrl.startsWith('http') ? [item.imageUrl] : [],
            metadata: {
              variantId: item.variantId,
              productId: item.productId || '',
            },
          },
          unit_amount: Math.max(unitAmount, 50),
        },
        quantity: item.quantity || 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: line_items.length > 0 ? line_items : [
        {
          price_data: {
            currency: 'gbp',
            product_data: { name: 'Poma Lifestyle Item' },
            unit_amount: 2500,
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail || undefined,
      metadata: {
        cartId: cartId || '',
      },
      success_url: `${baseUrl}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?canceled=true`,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Stripe checkout session' },
      { status: 500 }
    );
  }
}
