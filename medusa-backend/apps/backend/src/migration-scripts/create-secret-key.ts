import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createApiKeysWorkflow } from "@medusajs/medusa/core-flows";

export default async function createSecretKey({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: keys } = await query.graph({
    entity: "api_key",
    fields: ["id", "title", "token", "type"],
  });

  const existingSecret = keys.find((k: any) => k.type === "secret" && k.token);
  if (existingSecret) {
    logger.info(`Existing Secret Key token: ${existingSecret.token}`);
    return;
  }

  const { result } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Storefront Backend Secret Key",
          type: "secret",
          created_by: "",
        },
      ],
    },
  });

  logger.info(`Created Secret Key: ${JSON.stringify(result)}`);
}
