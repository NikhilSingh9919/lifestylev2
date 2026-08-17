import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function inspect({ container }: { container: MedusaContainer }) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "email", "status", "fulfillment_status", "payment_status", "fulfillments.*", "created_at", "total", "subtotal"],
  });
  console.log("TOTAL ORDERS IN DB:", orders.length);
  const o31 = orders.find((o: any) => o.display_id === 31 || String(o.display_id) === "31");
  console.log("ORDER 31 DATA:", JSON.stringify(o31 || orders[orders.length - 1], null, 2));
}
