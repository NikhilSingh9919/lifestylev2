import { ExecArgs } from "@medusajs/framework/types";
import {
  createInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function seedInventory({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION);
  const inventoryModuleService = container.resolve(Modules.INVENTORY);

  logger.info("Stocking inventory for all items...");

  const locations = await stockLocationModuleService.listStockLocations({});
  if (locations.length === 0) {
    logger.warn("No stock locations found.");
    return;
  }
  const locationId = locations[0].id;
  logger.info(`Using stock location: ${locationId}`);

  const inventoryItems = await inventoryModuleService.listInventoryItems({}, { take: 1000 });
  logger.info(`Found ${inventoryItems.length} inventory items.`);

  for (const item of inventoryItems) {
    try {
      const levels = await inventoryModuleService.listInventoryLevels({
        inventory_item_id: item.id,
        location_id: locationId,
      });

      if (levels.length === 0) {
        await createInventoryLevelsWorkflow(container).run({
          input: {
            inventory_levels: [
              {
                location_id: locationId,
                stocked_quantity: 10000,
                inventory_item_id: item.id,
              },
            ],
          },
        });
        logger.info(`Created level for item ${item.id}`);
      } else {
        await inventoryModuleService.updateInventoryLevels([
          {
            id: levels[0].id,
            stocked_quantity: 10000,
            location_id: locationId,
            inventory_item_id: item.id,
          },
        ]);
        logger.info(`Updated level for item ${item.id} to 10000`);
      }
    } catch (e: any) {
      logger.warn(`Error on item ${item.id}: ${e.message}`);
    }
  }

  logger.info("Finished stocking inventory for all products!");
}
