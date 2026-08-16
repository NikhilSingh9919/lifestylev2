import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  const countries = ["gb", "de", "dk", "se", "fr", "es", "it"];

  logger.info("Seeding store data...");

  const { data: existingSalesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });

  let defaultSalesChannel = existingSalesChannels[0];
  if (!defaultSalesChannel) {
    const {
      result: [sc],
    } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
            description: "Created by Medusa",
          },
        ],
      },
    });
    defaultSalesChannel = sc as any;
  }

  const { data: existingApiKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "title"],
  });

  let publishableApiKey: any = existingApiKeys[0];
  if (!publishableApiKey) {
    const {
      result: [key],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Default Publishable API Key",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });
    publishableApiKey = key as any;

    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: publishableApiKey.id,
        add: [defaultSalesChannel.id],
      },
    });
  }

  const { data: existingStores } = await query.graph({
    entity: "store",
    fields: ["id", "name"],
  });

  if (existingStores.length === 0) {
    await createStoresWorkflow(container).run({
      input: {
        stores: [
          {
            name: "Default Store",
            supported_currencies: [
              {
                currency_code: "eur",
                is_default: true,
              },
              {
                currency_code: "usd",
                is_default: false,
              },
            ],
            default_sales_channel_id: defaultSalesChannel.id,
          },
        ],
      },
    });
  }

  logger.info("Seeding region data...");
  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name"],
  });

  let region = existingRegions[0];
  if (!region) {
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Europe",
            currency_code: "eur",
            countries,
            payment_providers: ["pp_system_default", "pp_stripe_stripe"],
          },
        ],
      },
    });
    region = regionResult[0] as any;
  }
  logger.info("Finished seeding regions.");

  const { data: existingTaxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code"],
  });

  if (existingTaxRegions.length === 0) {
    logger.info("Seeding tax regions...");
    await createTaxRegionsWorkflow(container).run({
      input: countries.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    });
    logger.info("Finished seeding tax regions.");
  }

  logger.info("Seeding stock location data...");
  const { data: existingStockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });

  let stockLocation: any = existingStockLocations[0];
  if (!stockLocation) {
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: "European Warehouse",
            address: {
              city: "Copenhagen",
              country_code: "DK",
              address_1: "",
            },
          },
        ],
      },
    });
    stockLocation = stockLocationResult[0] as any;
  }

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const existingSets = await fulfillmentModuleService.listFulfillmentSets({
    name: "European Warehouse delivery",
  });

  let fulfillmentSet = existingSets[0];
  if (!fulfillmentSet) {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "European Warehouse delivery",
      type: "shipping",
      service_zones: [
        {
          name: "Europe",
          geo_zones: [
            { country_code: "gb", type: "country" },
            { country_code: "de", type: "country" },
            { country_code: "dk", type: "country" },
            { country_code: "se", type: "country" },
            { country_code: "fr", type: "country" },
            { country_code: "es", type: "country" },
            { country_code: "it", type: "country" },
          ],
        },
      ],
    });

    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id,
      },
    });

    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standard Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Standard",
            description: "Ship in 2-3 days.",
            code: "standard",
          },
          prices: [
            { currency_code: "usd", amount: 10 },
            { currency_code: "eur", amount: 10 },
            { region_id: region.id, amount: 10 },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
        {
          name: "Express Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Express",
            description: "Ship in 24 hours.",
            code: "express",
          },
          prices: [
            { currency_code: "usd", amount: 10 },
            { currency_code: "eur", amount: 10 },
            { region_id: region.id, amount: 10 },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    });
  }
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding product data...");

  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  });

  let categoryMap: Record<string, string> = {};
  existingCategories.forEach((cat: any) => {
    categoryMap[cat.name] = cat.id;
  });

  const categoriesToCreate = ["Products", "Accessories"].filter(
    (name) => !categoryMap[name]
  );

  if (categoriesToCreate.length > 0) {
    const { result: createdCategories } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: {
        product_categories: categoriesToCreate.map((name) => ({
          name,
          is_active: true,
        })),
      },
    });

    createdCategories.forEach((cat: any) => {
      categoryMap[cat.name] = cat.id;
    });
  }

  const productsCat = categoryMap["Products"];
  const accessoriesCat = categoryMap["Accessories"];

  const { data: existingOptions } = await query.graph({
    entity: "product_option",
    fields: ["id", "title"],
  });

  let colorOption = existingOptions.find((o: any) => o.title === "Color");
  if (!colorOption) {
    const { result: productOptionsResult } = await createProductOptionsWorkflow(
      container
    ).run({
      input: {
        product_options: [
          {
            title: "Color",
            values: ["Charcoal Black", "Cotton White", "Satin Gold", "Matte Silver"],
          },
        ],
      },
    });
    colorOption = productOptionsResult.find((o) => o.title === "Color") as any;
  }

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  });
  const existingHandles = new Set(existingProducts.map((p: any) => p.handle));

  const catalogData = {
  "store": "Poma Lifestyle Distributor Store",
  "source_domain": "pomalifestyle.com",
  "currency_code": "usd",
  "products": [
    {
      "title": "Pomabrush Model 2.0 with UV-C Charging Case",
      "handle": "pomabrush-model-2-0",
      "subtitle": "Sonic Electric Toothbrush with Sanitizing Travel Case",
      "description": "The Pomabrush Model 2.0 combines cutting-edge sonic vibration technology with a hygienic, antimicrobial silicone body and a UV-C sanitizing travel case. Engineered with a smart pressure sensor to safeguard enamel and gums, it delivers 41,000 vibrations per minute across three brushing modes for an elevated daily ritual.",
      "category": "Oral Care",
      "subcategory": "Electric Toothbrush",
      "options": [
        {
          "title": "Color",
          "values": [
            "Black",
            "White",
            "Carbon"
          ]
        }
      ],
      "variants": [
        {
          "title": "Black",
          "sku": "PL-PB02-BLK",
          "barcode": "6091326700105",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 12900
            }
          ],
          "options": {
            "Color": "Black"
          },
          "manage_inventory": true,
          "inventory_quantity": 100
        },
        {
          "title": "White",
          "sku": "PL-PB02-WHT",
          "barcode": "6091326700112",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 12900
            }
          ],
          "options": {
            "Color": "White"
          },
          "manage_inventory": true,
          "inventory_quantity": 100
        },
        {
          "title": "Carbon",
          "sku": "PL-PB02-CRB",
          "barcode": "6091326700129",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 12900
            }
          ],
          "options": {
            "Color": "Carbon"
          },
          "manage_inventory": true,
          "inventory_quantity": 100
        }
      ],
      "metadata": {
        "vibrations_per_minute": 41000,
        "modes": [
          "Cleaning",
          "Whitening",
          "Massage"
        ],
        "battery_life": "Up to 60 days on a single charge",
        "timer": "2-minute smart timer with 30-second interval pacing",
        "pressure_sensor": "Integrated Smart Pressure Sensor",
        "waterproofing": "IPX7 Waterproof",
        "charging_case": "UV-C Sanitizing Wireless Travel Case with hygiene cycle",
        "case_charging_type": "USB-C fast charging & magnetic snap",
        "whats_in_the_box": [
          "1x Pomabrush Model 2.0 Handle",
          "1x UV-C Sanitizing Travel Case",
          "1x Magnetic Charging Cable",
          "1x USB-C Fast Charging Cable",
          "3x Advanced Brush Heads (9-month supply)"
        ],
        "warranty": "24-Month Limited Warranty"
      }
    },
    {
      "title": "Pomafloss Model 1.0 - Portable Water Flosser",
      "handle": "pomafloss-model-1-0",
      "subtitle": "Compact Travel Water Flosser",
      "description": "Pomafloss Model 1.0 delivers targeted water pulses to reach deep between teeth and along the gumline where traditional dental floss cannot. Featuring an ergonomic fingertip control and a 360-degree rotating nozzle, it offers effortless oral hygiene on the go.",
      "category": "Oral Care",
      "subcategory": "Water Flosser",
      "options": [
        {
          "title": "Color",
          "values": [
            "Black",
            "White"
          ]
        }
      ],
      "variants": [
        {
          "title": "Black",
          "sku": "PL-PF01-BLK",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 6450
            }
          ],
          "options": {
            "Color": "Black"
          },
          "manage_inventory": true,
          "inventory_quantity": 100
        },
        {
          "title": "White",
          "sku": "PL-PF01-WHT",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 6450
            }
          ],
          "options": {
            "Color": "White"
          },
          "manage_inventory": true,
          "inventory_quantity": 100
        }
      ],
      "metadata": {
        "pulse_rate": "1,300 pulses per minute",
        "water_tank_capacity": "100 ml",
        "battery_life": "Up to 30 days on a single charge",
        "nozzle": "360\u00b0 Rotatable Precision Nozzle",
        "charging_type": "USB-C Fast Charging",
        "waterproofing": "IPX7 Waterproof",
        "whats_in_the_box": [
          "1x Pomafloss Model 1.0 Unit",
          "1x Standard Rotatable Nozzle",
          "1x USB-C Fast Charging Cable"
        ],
        "warranty": "24-Month Limited Warranty"
      }
    },
    {
      "title": "Pomafloss Model 2.0 - Advanced Water Flosser",
      "handle": "pomafloss-model-2-0",
      "subtitle": "UV-C Clean Advanced Water Flosser",
      "description": "Elevate your oral health with Pomafloss Model 2.0. Equipped with a built-in UV-C light sanitation cycle in the reservoir to ensure sterile water flossing, customizable 4-level pressure settings plus pulse mode, and a 360-degree rotating nozzle.",
      "category": "Oral Care",
      "subcategory": "Water Flosser",
      "options": [
        {
          "title": "Color",
          "values": [
            "Black",
            "White"
          ]
        }
      ],
      "variants": [
        {
          "title": "Black",
          "sku": "PL-PF02-BLK",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 11500
            }
          ],
          "options": {
            "Color": "Black"
          },
          "manage_inventory": true,
          "inventory_quantity": 100
        },
        {
          "title": "White",
          "sku": "PL-PF02-WHT",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 11500
            }
          ],
          "options": {
            "Color": "White"
          },
          "manage_inventory": true,
          "inventory_quantity": 100
        }
      ],
      "metadata": {
        "pulse_rate": "1,300 pulses per minute",
        "sanitization": "Built-in UV-C Light Clean System for tank and nozzle",
        "pressure_settings": "4 Pressure Intensity Settings + 1 Pulse Mode",
        "nozzle": "360\u00b0 Rotatable Ergonomic Nozzle",
        "waterproofing": "IPX7 Waterproof",
        "battery_life": "Up to 45 days",
        "charging_type": "USB-C Fast Charging",
        "whats_in_the_box": [
          "1x Pomafloss Model 2.0 Unit",
          "2x Precision Nozzles",
          "1x USB-C Fast Charging Cable",
          "1x User Manual"
        ],
        "warranty": "24-Month Limited Warranty"
      }
    },
    {
      "title": "Pomabru - Portable Espresso Machine",
      "handle": "pomabru-portable-espresso-machine",
      "subtitle": "Self-Heating 25-Bar Portable Espresso Maker",
      "description": "Pomabru reimagines the espresso ritual for travel, outdoor adventures, and remote workspaces. Engineered with 25-bar extraction pressure, intelligent self-heating reaching 92\u00b0C+, a 9,600 mAh multi-cell battery, and dual compatibility with both ground coffee and capsules.",
      "category": "Lifestyle",
      "subcategory": "Coffee & Beverage",
      "options": [
        {
          "title": "Color",
          "values": [
            "Matte Black"
          ]
        }
      ],
      "variants": [
        {
          "title": "Matte Black",
          "sku": "PL-PBRU01-BLK",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 19995
            }
          ],
          "options": {
            "Color": "Matte Black"
          },
          "manage_inventory": true,
          "inventory_quantity": 50
        }
      ],
      "metadata": {
        "extraction_pressure": "25 Bar",
        "heating_system": "Self-heating system (optimal brewing temp 92\u00b0C+)",
        "battery_capacity": "9,600 mAh (3 \u00d7 3,200 mAh high-density cells)",
        "brew_capacity": "Up to 100 shots (pre-heated water) or multiple heated brews per charge",
        "charging_type": "USB-C Fast Charging (DC 12V / 120W, QC/PD compatible)",
        "recharge_time": "Approx. 3 hours with 30W+ adapter",
        "power_bank_feature": "USB-C Output (5V / 2.8A) to charge external mobile devices",
        "coffee_compatibility": "Ground coffee, Nespresso-compatible pods, and Dolce Gusto-style pods",
        "operation": "Single-button intelligent control",
        "whats_in_the_box": [
          "1x Pomabru Portable Espresso Machine",
          "1x Ground Coffee Adapter & Measuring Scoop",
          "1x Pod / Capsule Chamber Adapter",
          "1x USB-C Fast Charging Cable",
          "1x Water-Resistant Premium Travel Carry Case"
        ],
        "warranty": "24-Month Limited Warranty"
      }
    },
    {
      "title": "Pomabrush - Advanced Brush Heads (Pack of 4)",
      "handle": "pomabrush-advanced-brush-heads-4pack",
      "subtitle": "1-Year Supply W-Shaped Hybrid Replacement Heads",
      "description": "Featuring a precision W-shaped slope, these advanced brush heads integrate soft charcoal-infused nylon inner bristles with antibacterial silicone outer bristles (~0.5mm diameter) to lift stubborn surface stains while gently massaging sensitive gumlines.",
      "category": "Accessories",
      "subcategory": "Brush Heads",
      "options": [
        {
          "title": "Color",
          "values": [
            "Black",
            "White"
          ]
        }
      ],
      "variants": [
        {
          "title": "Black",
          "sku": "PL-BH02ADNY4PC-BLK",
          "barcode": "6091326700020",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 2200
            }
          ],
          "options": {
            "Color": "Black"
          },
          "manage_inventory": true,
          "inventory_quantity": 200
        },
        {
          "title": "White",
          "sku": "PL-BH02ADNY4PC-WHT",
          "barcode": "6091326700037",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 2200
            }
          ],
          "options": {
            "Color": "White"
          },
          "manage_inventory": true,
          "inventory_quantity": 200
        }
      ],
      "metadata": {
        "pack_size": 4,
        "recommended_lifespan": "3 months per brush head (1 Year total supply)",
        "bristle_type": "Charcoal-infused PBT Nylon (inner) & Antimicrobial Silicone (outer)",
        "bristle_contour": "W-Shaped Curve",
        "compatibility": "Compatible with all Pomabrush models",
        "material": "BPA-free plastic, medical-grade silicone, nylon",
        "dimensions": "11.5cm H x 5cm W x 3.5cm D",
        "weight": "40g"
      }
    },
    {
      "title": "Pomabrush - Nylon-Silicone Brush Heads (Pack of 4)",
      "handle": "pomabrush-nylon-silicone-brush-heads-4pack",
      "subtitle": "1-Year Supply Medium Bristle Hybrid Replacement Heads",
      "description": "Hybrid brush heads designed for balanced deep cleaning and gum protection. Combines charcoal nylon inner bristles with soft antimicrobial silicone perimeter bristles.",
      "category": "Accessories",
      "subcategory": "Brush Heads",
      "options": [
        {
          "title": "Color",
          "values": [
            "Black",
            "White"
          ]
        }
      ],
      "variants": [
        {
          "title": "Black",
          "sku": "PL-BH01NY4PC-BLK",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 1450
            }
          ],
          "options": {
            "Color": "Black"
          },
          "manage_inventory": true,
          "inventory_quantity": 200
        },
        {
          "title": "White",
          "sku": "PL-BH01NY4PC-WHT",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 1450
            }
          ],
          "options": {
            "Color": "White"
          },
          "manage_inventory": true,
          "inventory_quantity": 200
        }
      ],
      "metadata": {
        "pack_size": 4,
        "recommended_lifespan": "3 months per brush head (1 Year total supply)",
        "bristle_type": "Charcoal nylon inner bristles & antimicrobial silicone outer edges",
        "compatibility": "Compatible with all Pomabrush models"
      }
    },
    {
      "title": "Pomabrush - Pure Silicone Brush Heads (Pack of 2)",
      "handle": "pomabrush-pure-silicone-brush-heads-2pack",
      "subtitle": "1-Year Supply Extra Soft Medical-Grade Silicone Heads",
      "description": "Made entirely from 100% medical-grade antimicrobial silicone, these ultra-gentle brush heads are ideal for users experiencing gum sensitivity, recession, or enamel wear.",
      "category": "Accessories",
      "subcategory": "Brush Heads",
      "options": [
        {
          "title": "Color",
          "values": [
            "Black",
            "White"
          ]
        }
      ],
      "variants": [
        {
          "title": "Black",
          "sku": "PL-BH01SIL2PC-BLK",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 900
            }
          ],
          "options": {
            "Color": "Black"
          },
          "manage_inventory": true,
          "inventory_quantity": 200
        },
        {
          "title": "White",
          "sku": "PL-BH01SIL2PC-WHT",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 900
            }
          ],
          "options": {
            "Color": "White"
          },
          "manage_inventory": true,
          "inventory_quantity": 200
        }
      ],
      "metadata": {
        "pack_size": 2,
        "recommended_lifespan": "6 months per brush head (1 Year total supply)",
        "bristle_type": "100% Antimicrobial Medical-Grade Silicone (~0.5mm)",
        "compatibility": "Compatible with all Pomabrush models"
      }
    },
    {
      "title": "Pomaclip - Magnetic Toothbrush Holder",
      "handle": "pomaclip-magnetic-toothbrush-holder",
      "subtitle": "Minimalist Wall Mount Toothbrush Holder",
      "description": "A stylish, minimalist magnetic holder designed to mount your Pomabrush securely to mirrors, bathroom tiles, or smooth surfaces, eliminating counter clutter.",
      "category": "Accessories",
      "subcategory": "Mounts & Holders",
      "options": [
        {
          "title": "Color",
          "values": [
            "Black",
            "White",
            "Forest Green",
            "Santorini Blue",
            "Ocean Coral"
          ]
        }
      ],
      "variants": [
        {
          "title": "Black",
          "sku": "PMD-CLBLK01",
          "barcode": "4751038550048",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 1900
            }
          ],
          "options": {
            "Color": "Black"
          },
          "manage_inventory": true,
          "inventory_quantity": 150
        },
        {
          "title": "White",
          "sku": "PMD-CLWHT01",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 1900
            }
          ],
          "options": {
            "Color": "White"
          },
          "manage_inventory": true,
          "inventory_quantity": 150
        },
        {
          "title": "Forest Green",
          "sku": "PMD-CLGRN01",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 1900
            }
          ],
          "options": {
            "Color": "Forest Green"
          },
          "manage_inventory": true,
          "inventory_quantity": 50
        },
        {
          "title": "Santorini Blue",
          "sku": "PMD-CLBLU01",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 1900
            }
          ],
          "options": {
            "Color": "Santorini Blue"
          },
          "manage_inventory": true,
          "inventory_quantity": 50
        },
        {
          "title": "Ocean Coral",
          "sku": "PMD-CLCOR01",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 1900
            }
          ],
          "options": {
            "Color": "Ocean Coral"
          },
          "manage_inventory": true,
          "inventory_quantity": 50
        }
      ],
      "metadata": {
        "dimensions": "6.5cm L x 6.5cm W x 2cm D",
        "material": "Non-toxic, BPA-free plastic with integrated magnetic core",
        "installation": "High-strength adhesive backing for tiles, mirrors, and glass",
        "compatibility": "Tailored for all Pomabrush electric toothbrush models"
      }
    },
    {
      "title": "Pomacloth - Microfibre Cleaning Cloth",
      "handle": "pomacloth-microfibre-cleaning-cloth",
      "subtitle": "Delicate Care Microfibre Device Cloth",
      "description": "Specifically designed ultra-soft microfibre cloth tailored to gently dry, polish, and maintain Poma oral care devices free from dust, water spots, and fingerprints.",
      "category": "Accessories",
      "subcategory": "Care & Cleaning",
      "options": [
        {
          "title": "Color",
          "values": [
            "Black"
          ]
        }
      ],
      "variants": [
        {
          "title": "Black",
          "sku": "PL-MCC01-BLK",
          "prices": [
            {
              "currency_code": "usd",
              "amount": 500
            }
          ],
          "options": {
            "Color": "Black"
          },
          "manage_inventory": true,
          "inventory_quantity": 300
        }
      ],
      "metadata": {
        "dimensions": "24cm x 16cm",
        "stitching": "Floss Edge Finish",
        "fabric": "High-density lint-free microfibre",
        "application": "Drying and polishing Pomabrush, Pomafloss, and charging cases"
      }
    }
  ]
};

  const allProductsToSeed = catalogData.products.map((p) => {
    const isAccessory = p.category === 'Accessories';
    const catId = isAccessory ? accessoriesCat : productsCat;
    return {
      title: p.title,
      subtitle: p.subtitle || undefined,
      category_ids: [catId],
      description: p.description,
      handle: p.handle,
      weight: 200,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: [
        { url: '/assets/figma/' + (p.handle.includes('brush') ? 'hero-featured.png' : p.handle.includes('floss') ? 'lineup-pomafloss.png' : p.handle.includes('bru') ? 'lineup-pomabru.png' : 'accessory-1.png') }
      ],
      options: p.options,
      variants: p.variants.map((v: any) => ({
        title: v.title,
        sku: v.sku,
        barcode: v.barcode || undefined,
        options: v.options,
        prices: v.prices.map((pr: any) => ({
          amount: pr.amount / 100,
          currency_code: pr.currency_code
        })),
      })),
      metadata: p.metadata || {},
      sales_channels: [{ id: defaultSalesChannel.id }],
    };
  });

  const newProductsToCreate = allProductsToSeed.filter(
    (p) => !existingHandles.has(p.handle)
  );

  if (newProductsToCreate.length > 0) {
    await createProductsWorkflow(container).run({
      input: {
        products: newProductsToCreate,
      },
    });
  }
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: existingLevels } = await query.graph({
    entity: "inventory_level",
    fields: ["id", "inventory_item_id", "location_id"],
  });

  const existingLevelKeys = new Set(
    existingLevels.map((l: any) => `${l.inventory_item_id}:${l.location_id}`)
  );

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const itemsToCreate = inventoryItems.filter(
    (item: any) => !existingLevelKeys.has(`${item.id}:${stockLocation.id}`)
  );

  if (itemsToCreate.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: itemsToCreate.map((item) => ({
          location_id: stockLocation.id,
          stocked_quantity: 1000000,
          inventory_item_id: item.id,
        })),
      },
    });
  }

  logger.info("Finished seeding inventory levels data.");
}
