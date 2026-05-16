export type CouponConfig = {
  type: "fixed" | "percent";
  value: number;
  requiresFirstOrder?: boolean;
  allowedMethods?: string[];
  minSubtotal?: number;
};

export type PromoOffer = {
  code: string;
  discount: number;
  headline: string;
};

export const COUPONS: Record<string, CouponConfig> = {
  BEMVINDO20: {
    type: "fixed",
    value: 20.0,
    requiresFirstOrder: true,
    allowedMethods: ["PIX", "Dinheiro"],
  },
  PIX6: {
    type: "percent",
    value: 6,
    allowedMethods: ["PIX"],
  },
  PIZZA8: {
    type: "percent",
    value: 8,
    minSubtotal: 89.99,
  },
  PIZZA10: {
    type: "percent",
    value: 10,
    minSubtotal: 99.99,
  },
  PIZZA12: {
    type: "percent",
    value: 12,
    minSubtotal: 179.99,
  },
  PIZZA15: {
    type: "percent",
    value: 15,
    minSubtotal: 399.99,
    allowedMethods: ["PIX", "Dinheiro"],
  },
};

function formatBRL(value: number) {
  const n = Number.isFinite(value) ? value : 0;
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

function normalizeCode(code: string) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function getOrdersCount() {
  try {
    const n = Number(localStorage.getItem("sitari_orders_count") || "0");
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function validateCoupon(subtotal: number, method: string, couponCode: string) {
  const code = normalizeCode(couponCode);
  const coupon = COUPONS[code];
  const normalizedMethod = String(method || "").trim();

  if (!code) {
    return { ok: false, code: "", reason: "Cupom inválido." };
  }
  if (!coupon) {
    return { ok: false, code, reason: "Cupom inválido." };
  }

  if (coupon.allowedMethods && coupon.allowedMethods.length > 0) {
    if (!coupon.allowedMethods.includes(normalizedMethod)) {
      return {
        ok: false,
        code,
        reason: `Cupom válido apenas para ${coupon.allowedMethods.join("/")}.`,
      };
    }
  }

  if (coupon.requiresFirstOrder) {
    const isFirstOrder = getOrdersCount() === 0;
    if (!isFirstOrder) {
      return {
        ok: false,
        code,
        reason: "Cupom disponível apenas no primeiro pedido.",
      };
    }
  }

  const minSubtotal = coupon.minSubtotal;
  if (typeof minSubtotal === "number" && subtotal < minSubtotal) {
    const missing = Math.max(0, minSubtotal - subtotal);
    const progress =
      minSubtotal > 0 ? Math.max(0, Math.min(1, subtotal / minSubtotal)) : 0;
    return {
      ok: false,
      code,
      reason: `Falta ${formatBRL(missing)} para liberar o desconto.`,
      minSubtotal,
      missing,
      progress,
    };
  }

  return { ok: true, code };
}

export function calculateDiscount(subtotal: number, method: string, couponCode: string) {
  const code = normalizeCode(couponCode);
  const coupon = COUPONS[code];
  if (!coupon) return 0;

  const validation = validateCoupon(subtotal, method, code);
  if (!validation.ok) return 0;

  if (coupon.type === "fixed") {
    return Math.max(0, Math.min(subtotal, coupon.value));
  }

  if (coupon.type === "percent") {
    const pct = Math.max(0, coupon.value) / 100;
    return Math.max(0, Math.min(subtotal, subtotal * pct));
  }

  return 0;
}

export function findBestCoupon(subtotal: number, method: string): PromoOffer | null {
  const candidates = Object.keys(COUPONS).map((code) => {
    const discount = calculateDiscount(subtotal, method, code);
    return { code, discount };
  });

  const best = candidates.reduce(
    (acc, c) => (c.discount > acc.discount ? c : acc),
    { code: "", discount: 0 }
  );

  if (!best.code || best.discount <= 0) return null;

  const coupon = COUPONS[best.code];
  const headline =
    coupon.type === "percent"
      ? `${coupon.value}% de DESCONTO LIBERADO`
      : `${formatBRL(coupon.value)} OFF LIBERADO`;

  return {
    code: best.code,
    discount: best.discount,
    headline,
  };
}

export function getNewlyUnlockedThresholdCoupon(prevSubtotal: number, subtotal: number) {
  const thresholdCodes = Object.entries(COUPONS)
    .filter(([, c]) => typeof c.minSubtotal === "number")
    .sort((a, b) => (a[1].minSubtotal || 0) - (b[1].minSubtotal || 0))
    .map(([code, c]) => ({ code, minSubtotal: c.minSubtotal as number }));

  for (const { code, minSubtotal } of thresholdCodes) {
    if (prevSubtotal < minSubtotal && subtotal >= minSubtotal) {
      return code;
    }
  }
  return "";
}
