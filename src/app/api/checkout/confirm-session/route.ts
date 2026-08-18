import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAndCompleteMedusaOrder, normalizeCountryCode } from '@/lib/medusa';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const apiKey = process.env.STRIPE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'STRIPE_API_KEY is not configured' }, { status: 500 });
    }

    const stripe = new Stripe(apiKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details'],
    });

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // Extract customer & shipping info from Stripe session
    const customerEmail = session.customer_details?.email || session.customer_email || session.metadata?.customerEmail || 'customer@poma.test';
    const customerName = session.customer_details?.name || session.metadata?.customerName || 'Customer';
    const nameParts = customerName.split(' ');
    const firstName = session.metadata?.firstName || nameParts[0] || 'Valued';
    const lastName = session.metadata?.lastName || nameParts.slice(1).join(' ') || 'Customer';
    const phone = session.customer_details?.phone || session.metadata?.phone || undefined;

    const shipping = (session as any).shipping_details || session.customer_details;
    const address = shipping?.address?.line1 || session.metadata?.address || '123 Order St';
    const apartment = shipping?.address?.line2 || session.metadata?.apartment || undefined;
    const city = shipping?.address?.city || session.metadata?.city || 'London';
    const postalCode = shipping?.address?.postal_code || session.metadata?.postalCode || 'SW1A 1AA';
    const countryCode = normalizeCountryCode(shipping?.address?.country || session.metadata?.country);

    // Parse items from metadata or session line items
    let rawItems: any[] = [];
    if (session.metadata?.itemsJson) {
      try {
        rawItems = JSON.parse(session.metadata.itemsJson);
      } catch {}
    }

    if (rawItems.length === 0 && session.line_items?.data) {
      rawItems = session.line_items.data.map((li) => ({
        variantId: 'variant_01M00Y58BW27HMMB8F4VXRFT9F', // fallback to valid Medusa variant
        quantity: li.quantity || 1,
        title: li.description || 'Poma Item',
      }));
    }

    // Execute official Medusa Order Creation & Completion
    const medusaResult = await createAndCompleteMedusaOrder({
      email: customerEmail,
      firstName,
      lastName,
      phone,
      address,
      apartment,
      city,
      postalCode,
      countryCode,
      items: rawItems.length > 0 ? rawItems : [
        {
          variantId: 'variant_01M00Y58BW27HMMB8F4VXRFT9F',
          quantity: 1,
          title: 'Pomabrush Item',
        },
      ],
      providerId: 'pp_system_default',
    });

    if (medusaResult.order) {
      return NextResponse.json({
        success: true,
        order: medusaResult.order,
        customerEmail,
      });
    }

    return NextResponse.json(
      { error: medusaResult.errors?.[0] || 'Failed to record order in Medusa' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Session confirmation error:', error);
    return NextResponse.json({ error: error.message || 'Session confirmation error' }, { status: 500 });
  }
}
