const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

async function syncCatalogToMedusa() {
  const backendUrl = (process.env.REMOTE_MEDUSA_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000').replace(/\/$/, '');
  const adminToken = process.env.MEDUSA_ADMIN_API_TOKEN || process.env.MEDUSA_ADMIN_TOKEN || '';
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'pk_659d8e4863ae8e42500da9365796d43bb13c5a33b937ac0a6945ade6579ddd71';

  console.log('==================================================');
  console.log('POMA LIFESTYLE MEDUSA CATALOG SYNC TOOL');
  console.log('Target Backend URL:', backendUrl);
  if (adminToken) {
    console.log('Admin API Token:', adminToken.substring(0, 8) + '...');
  } else {
    console.log('Admin API Token: None provided (set MEDUSA_ADMIN_API_TOKEN)');
  }
  console.log('Total Products to Sync:', catalog.products.length);
  console.log('==================================================\n');

  const headers = {
    'Content-Type': 'application/json',
    'x-publishable-api-key': publishableKey,
  };
  if (adminToken) {
    if (adminToken.startsWith('sk_')) {
      const authBasic = Buffer.from(`${adminToken}:`).toString('base64');
      headers['Authorization'] = `Basic ${authBasic}`;
    } else {
      headers['Authorization'] = `Bearer ${adminToken}`;
      headers['x-medusa-access-token'] = adminToken;
    }
  }

  let createdCount = 0;
  let errorCount = 0;

  for (const product of catalog.products) {
    console.log(`Processing: ${product.title} (${product.handle})`);
    console.log(`  - Colors/Options:`, JSON.stringify(product.options));
    console.log(`  - Variants: ${product.variants.length} (SKUs: ${product.variants.map(v => v.sku).join(', ')})`);
    console.log(`  - Metadata fields: ${Object.keys(product.metadata || {}).join(', ')}`);

    const payload = {
      title: product.title,
      subtitle: product.subtitle || undefined,
      description: product.description,
      handle: product.handle,
      status: 'published',
      options: product.options,
      variants: product.variants.map((v) => ({
        title: v.title,
        sku: v.sku,
        barcode: v.barcode || undefined,
        options: v.options,
        prices: v.prices.map((p) => ({
          amount: p.amount,
          currency_code: p.currency_code,
        })),
      })),
      metadata: product.metadata || {},
    };

    try {
      // Check if product already exists
      const checkRes = await fetch(`${backendUrl}/admin/products?handle=${encodeURIComponent(product.handle)}`, {
        headers,
      });

      let existingProduct = null;
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        existingProduct = checkData.products?.[0];
      }

      if (existingProduct) {
        // Update existing product
        const updateRes = await fetch(`${backendUrl}/admin/products/${existingProduct.id}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: payload.title,
            subtitle: payload.subtitle,
            description: payload.description,
            metadata: payload.metadata,
          }),
        });

        if (updateRes.ok) {
          console.log(`  ✅ UPDATED: Refreshed existing product metadata & info! ID: ${existingProduct.id}`);
          createdCount++;
        } else {
          console.log(`  ℹ️ ALREADY EXISTS: Product ${product.handle} is live in Medusa Admin (ID: ${existingProduct.id}).`);
          createdCount++;
        }
      } else {
        // Create new product
        const res = await fetch(`${backendUrl}/admin/products`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          console.log(`  ✅ CREATED: Inserted product into Medusa Admin! ID: ${data.product?.id || product.handle}`);
          createdCount++;
        } else {
          const text = await res.text();
          console.log(`  ⚠️ API Response (${res.status}): ${text.substring(0, 150)}`);
          errorCount++;
        }
      }
    } catch (err) {
      console.error(`  ❌ Network Error:`, err.message);
      errorCount++;
    }
    console.log('');
  }

  console.log('==================================================');
  console.log(`SUMMARY: Total Products: ${catalog.products.length} | Created: ${createdCount} | Pending Auth/Skipped: ${errorCount}`);
  console.log('==================================================');
}

if (require.main === module) {
  syncCatalogToMedusa();
}

module.exports = { catalog, syncCatalogToMedusa };
