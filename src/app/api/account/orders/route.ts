import { NextResponse } from 'next/server';
import { env } from '@/config/env';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/$/, '');
    const secretKey = 'sk_bd3c8e093d213c59670a8549fe67b6da7e8698fcf3f28d2635eca3b3ddb846c2';

    const authHeader = 'Basic ' + Buffer.from(secretKey + ':').toString('base64');

    const res = await fetch(`${backendUrl}/admin/orders?limit=100&fields=*items,*customer,*shipping_address,*summary,*fulfillments`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return NextResponse.json({ error: `Medusa admin orders API error: ${res.statusText}`, details: errText }, { status: res.status });
    }

    const data = await res.json();
    const rawOrders = data.orders || [];

    // Filter by customer email if provided
    const userOrders = email
      ? rawOrders.filter((o: any) => (o.email || o.customer?.email || '').toLowerCase() === email.toLowerCase())
      : rawOrders;

    const formattedOrders = userOrders.map((o: any) => {
      let finStatus = 'PAID';
      if (o.payment_status) {
        const ps = o.payment_status.toLowerCase();
        if (ps === 'captured' || ps === 'paid') finStatus = 'PAID';
        else if (ps === 'refunded') finStatus = 'REFUNDED';
        else if (ps === 'partially_refunded') finStatus = 'PARTIALLY REFUNDED';
        else finStatus = ps.toUpperCase();
      }

      let fulStatus = 'UNFULFILLED';
      if (o.fulfillments && o.fulfillments.length > 0) {
        const isDelivered = o.fulfillments.some((f: any) => f.delivered_at && !f.canceled_at);
        const isShipped = o.fulfillments.some((f: any) => f.shipped_at && !f.canceled_at);
        const isCanceled = o.fulfillments.every((f: any) => f.canceled_at);

        if (isDelivered) {
          fulStatus = 'DELIVERED';
        } else if (isShipped) {
          fulStatus = 'SHIPPED';
        } else if (isCanceled) {
          fulStatus = 'CANCELED';
        } else {
          fulStatus = 'FULFILLED';
        }
      } else if (o.fulfillment_status) {
        const fs = o.fulfillment_status.toLowerCase();
        if (fs === 'delivered') fulStatus = 'DELIVERED';
        else if (fs === 'fulfilled') fulStatus = 'FULFILLED';
        else if (fs === 'shipped') fulStatus = 'SHIPPED';
        else if (fs === 'partially_fulfilled' || fs === 'partially_shipped') fulStatus = 'PARTIALLY FULFILLED';
        else fulStatus = 'UNFULFILLED';
      }

      return {
        id: o.id,
        orderNumber: o.display_id || 1,
        displayId: o.display_id || 1,
        processedAt: o.created_at,
        financialStatus: finStatus,
        fulfillmentStatus: fulStatus,
        totalPrice: {
          amount: ((o.total || o.subtotal || 0) / (o.total > 1000 ? 100 : 1)).toFixed(2),
          currencyCode: (o.currency_code || 'GBP').toUpperCase(),
        },
        lineItems: (o.items || []).map((item: any) => ({
          title: item.title || item.product_title || 'Poma Item',
          quantity: item.quantity || 1,
          imageUrl: item.thumbnail || undefined,
        })),
      };
    });

    return NextResponse.json({ orders: formattedOrders });
  } catch (error: any) {
    console.error('Error fetching live customer orders:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
