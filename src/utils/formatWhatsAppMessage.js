export function formatWhatsAppMessage(items, addressOrOptions, maybeOptions) {
  const options =
    typeof addressOrOptions === "object" && addressOrOptions !== null
      ? addressOrOptions
      : maybeOptions || {};
  const address =
    typeof addressOrOptions === "string" ? addressOrOptions : options.address || "";
  const addressParts = options.addressParts || null;
  const customer = options.customer || null;

  const lines = [
    "🍕 *NOVO PEDIDO - SITARI PIZZARIA*",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
  ];

  let total = 0;
  items.forEach((item, i) => {
    const sub = item.price + item.extras.reduce((s, e) => s + e.price, 0);
    total += sub;
    lines.push(`*${i + 1}. ${item.name}*`);
    lines.push(`   📐 Tamanho: ${item.size}`);
    if (item.extras.length > 0) {
      lines.push("   ➕ Adicionais:");
      item.extras.forEach((e) =>
        lines.push(`      • ${e.name} (+R$ ${e.price.toFixed(2)})`)
      );
    }
    lines.push(`   💰 Subtotal: R$ ${sub.toFixed(2)}`);
    lines.push("");
  });

  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push(`*💳 TOTAL: R$ ${total.toFixed(2)}*`);
  lines.push("");

  if (customer?.name) {
    lines.push(`🙍 *Nome:* ${customer.name}`);
  }
  if (customer?.whatsapp) {
    lines.push(`📲 *WhatsApp:* ${customer.whatsapp}`);
  }
  if (customer?.name || customer?.whatsapp) {
    lines.push("");
  }

  if (options.fulfillment) {
    lines.push(`🚚 *Tipo:* ${options.fulfillment}`);
    lines.push("");
  }

  const hasParts =
    addressParts &&
    (addressParts.street ||
      addressParts.number ||
      addressParts.neighborhood ||
      addressParts.complement ||
      addressParts.reference);

  if (hasParts) {
    const baseLine = [addressParts.street, addressParts.number]
      .filter(Boolean)
      .join(", ");
    lines.push("📍 *Endereço de Entrega:*");
    if (baseLine) lines.push(`   ${baseLine}`);
    if (addressParts.neighborhood) lines.push(`   ${addressParts.neighborhood}`);
    if (addressParts.complement) lines.push(`   Complemento: ${addressParts.complement}`);
    if (addressParts.reference) lines.push(`   Referência: ${addressParts.reference}`);
    lines.push("");
  } else if (address) {
    lines.push("📍 *Endereço de Entrega:*");
    lines.push(`   ${address}`);
    lines.push("");
  }

  if (options.payment) {
    const paymentLine = [
      options.payment,
      options.paymentDetail ? `(${options.paymentDetail})` : "",
    ]
      .filter(Boolean)
      .join(" ");
    lines.push(`💰 *Pagamento:* ${paymentLine}`);
    if (options.changeFor) {
      lines.push(`   Troco para: ${options.changeFor}`);
    }
    lines.push("");
  }

  lines.push("_Pedido via cardápio digital Sitari_ 🚀");
  return lines.join("\n");
}
