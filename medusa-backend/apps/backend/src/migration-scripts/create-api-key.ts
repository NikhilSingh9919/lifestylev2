import { ExecArgs } from "@medusajs/framework/types";
import { createApiKeysWorkflow } from "@medusajs/core-flows";

export default async function seedApiKey({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const query = container.resolve("query");

  const { data: existingKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "token", "title", "type"],
  });

  logger.info(`Existing API keys: ${JSON.stringify(existingKeys)}`);

  let pubKey: any = existingKeys.find((k: any) => k.type === "publishable");
  let secretKey: any = existingKeys.find((k: any) => k.type === "secret");

  if (!pubKey) {
    logger.info("Creating publishable API key...");
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Web Storefront",
            type: "publishable",
            created_by: "seed",
          },
        ],
      },
    });
    pubKey = result[0] as any;
    logger.info(`Created Publishable API Key: ${JSON.stringify(pubKey)}`);
  } else {
    logger.info(`Found Publishable API Key: ${pubKey.token}`);
  }

  if (!secretKey) {
    logger.info("Creating secret admin API key...");
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Admin REST API Key",
            type: "secret",
            created_by: "seed",
          },
        ],
      },
    });
    secretKey = result[0] as any;
    logger.info(`Created Secret Admin API Key Token: ${secretKey.token}`);
  } else {
    logger.info(`Found Secret Admin API Key Token: ${secretKey.token}`);
  }
}
