import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function inspect({ container }: { container: MedusaContainer }) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "email", "status", "fulfillment_status", "payment_status", "fulfillments.*", "created_at", "total", "subtotal"],
  });
  const o31 = orders.find((o: any) => o.display_id === 31 || String(o.display_id) === "31");
  console.log("Order 31 fulfillments:", JSON.stringify(o31.fulfillments, null, 2));

  let fulStatus = "UNFULFILLED";
  if (o31.fulfillments && o31.fulfillments.length > 0) {
    const isDelivered = o31.fulfillments.some((f: any) => f.delivered_at && !f.canceled_at);
    const isShipped = o31.fulfillments.some((f: any) => f.shipped_at && !f.canceled_at);
    if (isDelivered) fulStatus = "DELIVERED";
    else if (isShipped) fulStatus = "SHIPPED";
    else fulStatus = "FULFILLED";
  }
  console.log("✅ Resolved fulfillmentStatus for Order 31:", fulStatus);
}
