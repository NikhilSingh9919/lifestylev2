import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
} from "@medusajs/framework/utils";
import {
  createRegionsWorkflow,
  updateRegionsWorkflow,
  createShippingOptionsWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function syncStoreSetup({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const link = container.resolve(ContainerRegistrationKeys.LINK);

  logger.info("Starting Medusa Store & Currency Synchronization...");

  // 1. Check Store currencies
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "name", "supported_currencies.*"],
  });

  logger.info(`Found ${stores.length} store(s).`);

  // 2. Fetch all products and variants
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "title", "sku", "price_set.id", "price_set.prices.*"],
  });

  logger.info(`Found ${variants.length} product variant(s).`);

  // 3. Ensure each variant has GBP, EUR, and INR prices in its price set
  const pricingService = container.resolve(ModuleRegistrationName.PRICING);

  for (const variant of variants) {
    const existingPrices = variant.price_set?.prices || [];
    const currencies = existingPrices.map((p: any) => p.currency_code.toLowerCase());
    
    // Determine base amount (default £25 / €25 / ₹2500 if missing, or use GBP price)
    const basePrice = existingPrices.find((p: any) => p.currency_code.toLowerCase() === "gbp")?.amount || 25;

    const pricesToAdd: Array<{ currency_code: string; amount: number }> = [];

    if (!currencies.includes("gbp")) {
      pricesToAdd.push({ currency_code: "gbp", amount: basePrice });
    }
    if (!currencies.includes("eur")) {
      pricesToAdd.push({ currency_code: "eur", amount: basePrice });
    }
    if (!currencies.includes("inr")) {
      pricesToAdd.push({ currency_code: "inr", amount: basePrice * 100 });
    }

    if (pricesToAdd.length > 0 && variant.price_set?.id) {
      logger.info(`Adding prices for variant ${variant.id} (${variant.sku || variant.title}): ${JSON.stringify(pricesToAdd)}`);
      await pricingService.addPrices({
        priceSetId: variant.price_set.id,
        prices: pricesToAdd,
      });
    }
  }

  // 4. Check & Update Regions to ensure only UK (gb), Ireland (ie), India (in) exist
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code", "countries.*", "payment_providers.*"],
  });

  logger.info(`Found ${regions.length} region(s).`);

  for (const r of regions) {
    logger.info(`Region: ${r.name} (${r.currency_code})`);
    try {
      await updateRegionsWorkflow(container).run({
        input: {
          selector: { id: r.id },
          update: {
            countries: ["gb", "ie", "in"],
            payment_providers: ["pp_stripe_stripe", "pp_system_default"],
          },
        },
      });
      logger.info(`Updated region ${r.name} (${r.id}) to countries gb, ie, in.`);
    } catch (e: any) {
      logger.warn(`Could not update countries for region ${r.id}: ${e.message}`);
    }
  }

  // 6. Ensure Shipping Options for all regions
  const { data: updatedRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
  });

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "name"],
  });
  const defaultProfile = shippingProfiles[0];

  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name", "fulfillment_sets.id", "fulfillment_sets.service_zones.id"],
  });
  const defaultLocation = stockLocations[0];
  const serviceZoneId = defaultLocation?.fulfillment_sets?.[0]?.service_zones?.[0]?.id;

  if (defaultProfile && serviceZoneId) {
    for (const reg of updatedRegions) {
      try {
        await createShippingOptionsWorkflow(container).run({
          input: [
            {
              name: `Express Tracked Shipping (${reg.currency_code.toUpperCase()})`,
              service_zone_id: serviceZoneId,
              shipping_profile_id: defaultProfile.id,
              provider_id: "manual_manual",
              price_type: "flat",
              type: {
                label: "Express",
                description: "3-5 Business Days Express Worldwide Delivery",
                code: "express",
              },
              prices: [
                {
                  currency_code: reg.currency_code,
                  amount: 0, // Free express shipping
                },
              ],
              rules: [],
            },
          ],
        });
        logger.info(`Created shipping option for region ${reg.name} (${reg.currency_code})`);
      } catch (e: any) {
        // May already exist
        logger.info(`Shipping option note for region ${reg.name}: ${e.message}`);
      }
    }
  }

  logger.info("Medusa Store & Currency Synchronization completed successfully!");
}
