import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createMedusaCart, updateMedusaCart } from '@/lib/medusa';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, email, customer, customerToken } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided for checkout.' }, { status: 400 });
    }

    const apiKey = process.env.STRIPE_API_KEY || process.env.STRIPE_SECRET_KEY;

    if (!apiKey || apiKey.includes('Placeholder')) {
      return NextResponse.json(
        {
          error: 'Stripe API key is not configured yet.',
          details: 'Please add your Stripe Secret Key (STRIPE_API_KEY=sk_test_...) into your .env.local file.',
        },
        { status: 400 }
      );
    }

    const stripe = new Stripe(apiKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    const userEmail = email || customer?.email || undefined;

    // 1. Create or ensure cart in Medusa backend
    const cart = await createMedusaCart(items, customerToken);
    const cartId = cart?.id || `cart_${Date.now()}`;

    // 2. Attach email & customer details to Medusa cart if available
    if (cart?.id && userEmail) {
      const updatePayload: any = { email: userEmail };
      if (customer?.firstName || customer?.lastName) {
        updatePayload.shipping_address = {
          first_name: customer.firstName || 'Customer',
          last_name: customer.lastName || '',
          address_1: customer.defaultAddress?.address1 || '123 Poma Way',
          city: customer.defaultAddress?.city || 'London',
          country_code: (customer.defaultAddress?.country || 'gb').toLowerCase().slice(0, 2),
          postal_code: customer.defaultAddress?.zip || 'EC1A 1BB',
        };
      }
      await updateMedusaCart(cart.id, updatePayload);
    }

    // 3. Prepare line items for Stripe Hosted Checkout
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title || 'Poma Lifestyle Item',
          images: item.imageUrl
            ? [item.imageUrl.startsWith('/') ? `${request.headers.get('origin')}${item.imageUrl}` : item.imageUrl]
            : [],
        },
        unit_amount: Math.round(parseFloat(item.price || '0') * 100),
      },
      quantity: item.quantity || 1,
    }));

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // 4. Create Stripe Hosted Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: userEmail,
      success_url: `${origin}/order/confirmed/${cartId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata: {
        cart_id: cartId,
      },
    });

    if (!session.url) {
      throw new Error('Stripe failed to return a checkout URL.');
    }

    return NextResponse.json({ url: session.url, cartId });
  } catch (err: any) {
    console.error('Stripe Hosted Checkout creation error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create Stripe checkout session.' },
      { status: 500 }
    );
  }
}
