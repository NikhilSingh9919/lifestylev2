import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows";

export default async function enableStripeProvider({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("Checking Medusa regions for Stripe payment provider linkage...");

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "payment_providers.*"],
  });

  if (!regions || regions.length === 0) {
    logger.info("No regions found to update.");
    return;
  }

  for (const region of regions) {
    const existingProviders = (region.payment_providers || []).map(
      (p: any) => p.id || p.provider_id
    );

    const targetProvider = "pp_stripe_stripe";

    if (!existingProviders.includes(targetProvider)) {
      logger.info(`Adding provider '${targetProvider}' to region '${region.name}' (${region.id})...`);
      const updatedProviders = Array.from(
        new Set([...existingProviders, targetProvider, "pp_system_default"])
      );

      try {
        await updateRegionsWorkflow(container).run({
          input: {
            selector: { id: region.id },
            update: {
              payment_providers: updatedProviders,
            },
          },
        });
        logger.info(`Successfully linked '${targetProvider}' to region '${region.name}'.`);
      } catch (err) {
        logger.error(`Failed to update region ${region.id} with Stripe provider:`, err as any);
      }
    } else {
      logger.info(`Region '${region.name}' already has provider '${targetProvider}'.`);
    }
  }
}
