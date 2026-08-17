import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, ModuleRegistrationName } from "@medusajs/framework/utils";

export default async function updateServiceZones({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentService = container.resolve(ModuleRegistrationName.FULFILLMENT);

  logger.info("Updating service zones for UK, Ireland & India...");

  const { data: serviceZones } = await query.graph({
    entity: "service_zone",
    fields: ["id", "name", "geo_zones.*"],
  });

  for (const sz of serviceZones) {
    logger.info(`Service Zone: ${sz.name} (${sz.id})`);
    try {
      await fulfillmentService.createGeoZones([
        {
          service_zone_id: sz.id,
          type: "country",
          country_code: "gb",
        },
        {
          service_zone_id: sz.id,
          type: "country",
          country_code: "ie",
        },
        {
          service_zone_id: sz.id,
          type: "country",
          country_code: "in",
        },
      ]);
      logger.info(`Added GB, IE, IN geo zones to service zone ${sz.id}`);
    } catch (e: any) {
      logger.info(`Geo zone update note for ${sz.id}: ${e.message}`);
    }
  }

  logger.info("Service zone update completed!");
}
