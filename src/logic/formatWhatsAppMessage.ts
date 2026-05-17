type AddressParts = {
  street?: string;
  number?: string;
  neighborhood?: string;
  complement?: string;
  reference?: string;
};

type Customer = {
  name?: string;
  whatsapp?: string;
};

type Options = {
  address?: string;
  addressParts?: AddressParts | null;
  locationLink?: string;
  customer?: Customer | null;
  couponCode?: string;
  discount?: number;
  fulfillment?: string;
  payment?: string;
  paymentDetail?: string;
  changeFor?: string;
};

type Item = {
  name: string;
  size?: string;
  qty?: number;
  price: number;
  extras?: { name: string; price: number }[];
  flavors?: string[];
};

export function formatWhatsAppMessage(
  items: Item[],
  addressOrOptions: string | Options,
  maybeOptions?: Options
) {
  const options =
    typeof addressOrOptions === "object" && addressOrOptions !== null
      ? addressOrOptions
      : maybeOptions || {};
  const address = typeof addressOrOptions === "string" ? addressOrOptions : options.address || "";
  const addressParts = options.addressParts || null;
  const locationLink = String(options.locationLink || "").trim();
  const customer = options.customer || null;
  const couponCode = options.couponCode || "";
  const discount = Number(options.discount || 0);

  const formatBRL = (v: number) => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;

  const lines = ["🍕 *NOVO PEDIDO - SITARI PIZZARIA*", "━━━━━━━━━━━━━━━━━━━━━━━━━━", ""];

  let total = 0;
  items.forEach((item, i) => {
    const qty = item.qty || 1;
    const extras = Array.isArray(item.extras) ? item.extras : [];
    const unit = item.price + extras.reduce((s, e) => s + e.price, 0);
    const sub = unit * qty;
    total += sub;
    lines.push(`*${i + 1}. ${item.name}*`);
    if (item.size) lines.push(`   📐 Tamanho: ${item.size}`);
    lines.push(`   🔢 Quantidade: ${qty}`);
    if (Array.isArray(item.flavors) && item.flavors.length > 1) {
      lines.push(`   🍕 Sabores: ${item.flavors.join(" / ")}`);
    }
    if (extras.length > 0) {
      lines.push("   ➕ Adicionais:");
      extras.forEach((e) => lines.push(`      • ${e.name} (+R$ ${e.price.toFixed(2)})`));
    }
    lines.push(`   💰 Subtotal: R$ ${sub.toFixed(2)}`);
    lines.push("");
  });

  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━");
  const hasDiscount = couponCode && Number.isFinite(discount) && discount > 0;
  if (hasDiscount) {
    const finalTotal = Math.max(0, total - discount);
    lines.push(`*💰 SUBTOTAL: ${formatBRL(total)}*`);
    lines.push(`[CUPOM APLICADO: ${String(couponCode).toUpperCase()}]`);
    lines.push(`[DESCONTO: - ${formatBRL(discount)}]`);
    if (options.payment) {
      const paymentLine = [options.payment, options.paymentDetail ? `(${options.paymentDetail})` : ""]
        .filter(Boolean)
        .join(" ");
      lines.push(`[MÉTODO DE PAGAMENTO: ${paymentLine}]`);
    }
    lines.push(`*💳 TOTAL: ${formatBRL(finalTotal)}*`);
  } else {
    lines.push(`*💳 TOTAL: ${formatBRL(total)}*`);
  }
  lines.push("");

  if (customer?.name) lines.push(`🙍 *Nome:* ${customer.name}`);
  if (customer?.whatsapp) lines.push(`📲 *WhatsApp:* ${customer.whatsapp}`);
  if (customer?.name || customer?.whatsapp) lines.push("");

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
    const baseLine = [addressParts.street, addressParts.number].filter(Boolean).join(", ");
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

  if (locationLink) {
    lines.push(`📍 LINK DE ENTREGA (GPS): ${locationLink}`);
    lines.push("");
  }

  if (options.payment) {
    const paymentLine = [options.payment, options.paymentDetail ? `(${options.paymentDetail})` : ""]
      .filter(Boolean)
      .join(" ");
    lines.push(`💰 *Pagamento:* ${paymentLine}`);
    if (options.changeFor) lines.push(`   Troco para: ${options.changeFor}`);
    lines.push("");
  }

  lines.push("_Pedido via cardápio digital Sitari_ 🚀");
  return lines.join("\n");
}
