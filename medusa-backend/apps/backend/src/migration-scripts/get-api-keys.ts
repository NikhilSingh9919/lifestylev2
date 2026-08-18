import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function getKeys({ container }: { container: MedusaContainer }) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: keys } = await query.graph({
    entity: "api_key",
    fields: ["id", "title", "token", "type"],
  });
  console.log("API KEYS IN DB:", JSON.stringify(keys, null, 2));
}
