const backendUrl = 'http://localhost:9000';
const pubKey = 'pk_659d8e4863ae8e42500da9365796d43bb13c5a33b937ac0a6945ade6579ddd71';

async function testFullOrderJourney() {
  console.log('--- 1. Fetching Store Region ---');
  const regRes = await fetch(`${backendUrl}/store/regions`, {
    headers: { 'x-publishable-api-key': pubKey, 'Content-Type': 'application/json' },
  });
  const regData = await regRes.json();
  const region = regData.regions[0];
  console.log('Region:', region.id, region.name, region.currency_code);

  console.log('\n--- 2. Fetching Variant ---');
  const prodRes = await fetch(`${backendUrl}/store/products?fields=*variants`, {
    headers: { 'x-publishable-api-key': pubKey, 'Content-Type': 'application/json' },
  });
  const prodData = await prodRes.json();
  const product = prodData.products[0];
  const variant = product.variants[0];
  console.log('Product:', product.title);
  console.log('Variant:', variant.id, variant.title);

  console.log('\n--- 3. Creating Medusa Cart ---');
  const cartRes = await fetch(`${backendUrl}/store/carts`, {
    method: 'POST',
    headers: { 'x-publishable-api-key': pubKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      region_id: region.id,
      items: [{ variant_id: variant.id, quantity: 1 }],
    }),
  });
  const cartData = await cartRes.json();
  const cartId = cartData.cart.id;
  console.log('Created Cart ID:', cartId);

  console.log('\n--- 4. Updating Cart with Customer & Shipping Details ---');
  const updateRes = await fetch(`${backendUrl}/store/carts/${cartId}`, {
    method: 'POST',
    headers: { 'x-publishable-api-key': pubKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'alex.luxury@example.com',
      shipping_address: {
        first_name: 'Alex',
        last_name: 'Vance',
        address_1: '45 Kensington High St',
        city: 'London',
        postal_code: 'W8 5ED',
        country_code: 'gb',
      },
    }),
  });
  const updateData = await updateRes.json();
  console.log('Updated Customer on Cart:', updateData.cart.customer?.email, 'Customer ID:', updateData.cart.customer_id);

  console.log('\n--- 5. Adding Shipping Method ---');
  const shipRes = await fetch(`${backendUrl}/store/shipping-options?cart_id=${cartId}`, {
    headers: { 'x-publishable-api-key': pubKey, 'Content-Type': 'application/json' },
  });
  const shipData = await shipRes.json();
  const shipOption = shipData.shipping_options[0];
  await fetch(`${backendUrl}/store/carts/${cartId}/shipping-methods`, {
    method: 'POST',
    headers: { 'x-publishable-api-key': pubKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ option_id: shipOption.id }),
  });
  console.log('Added Shipping Option:', shipOption.name);

  console.log('\n--- 6. Creating Payment Collection & Session ---');
  const payColRes = await fetch(`${backendUrl}/store/payment-collections`, {
    method: 'POST',
    headers: { 'x-publishable-api-key': pubKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart_id: cartId }),
  });
  const payColData = await payColRes.json();
  const payColId = payColData.payment_collection.id;

  await fetch(`${backendUrl}/store/payment-collections/${payColId}/payment-sessions`, {
    method: 'POST',
    headers: { 'x-publishable-api-key': pubKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider_id: 'pp_system_default' }),
  });
  console.log('Payment Session Initialized on Collection:', payColId);

  console.log('\n--- 7. Completing Cart to Place Real Order in Medusa ---');
  const completeRes = await fetch(`${backendUrl}/store/carts/${cartId}/complete`, {
    method: 'POST',
    headers: { 'x-publishable-api-key': pubKey, 'Content-Type': 'application/json' },
  });
  const completeData = await completeRes.json();
  console.log('Complete Response Type:', completeData.type);
  if (completeData.order) {
    const o = completeData.order;
    console.log('✅ Real Medusa Order ID:', o.id);
    console.log('✅ Real Medusa Display Number: Order #' + o.display_id);
    console.log('✅ Order Total:', o.total, o.currency_code);
    console.log('✅ Order Customer:', o.email, o.shipping_address?.first_name, o.shipping_address?.last_name);
    console.log('✅ Items Ordered:', (o.items || []).map((i) => `${i.title} (Qty: ${i.quantity})`));
    console.log('✅ Payment Status:', o.payment_status);
    console.log('✅ Fulfillment Status:', o.fulfillment_status);
  } else {
    console.error('Failed to complete order:', completeData);
  }
}

testFullOrderJourney().catch(console.error);
