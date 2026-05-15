import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

export const COUPONS = {
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

function formatBRL(value) {
  const n = Number.isFinite(value) ? value : 0;
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

function normalizeCode(code) {
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

function validateCoupon(subtotal, method, couponCode) {
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
      return { ok: false, code, reason: "Cupom disponível apenas no primeiro pedido." };
    }
  }

  const minSubtotal = coupon.minSubtotal;
  if (typeof minSubtotal === "number" && subtotal < minSubtotal) {
    const missing = Math.max(0, minSubtotal - subtotal);
    const progress = minSubtotal > 0 ? Math.max(0, Math.min(1, subtotal / minSubtotal)) : 0;
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

export function calculateDiscount(subtotal, method, couponCode) {
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

export function findBestCoupon(subtotal, method) {
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

export function getNewlyUnlockedThresholdCoupon(prevSubtotal, subtotal) {
  const thresholdCodes = Object.entries(COUPONS)
    .filter(([, c]) => typeof c.minSubtotal === "number")
    .sort((a, b) => a[1].minSubtotal - b[1].minSubtotal)
    .map(([code, c]) => ({ code, minSubtotal: c.minSubtotal }));

  for (const { code, minSubtotal } of thresholdCodes) {
    if (prevSubtotal < minSubtotal && subtotal >= minSubtotal) {
      return code;
    }
  }
  return "";
}

export function PromotionPopup({ open, coupon, onActivate, onClose }) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (!open) setIsConfirmed(false);
  }, [open]);

  if (!coupon) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
        >
          <div
            className="absolute inset-0 bg-black/60"
            style={{ backdropFilter: "blur(40px)" }}
            onClick={() => onClose?.()}
          />
          <motion.div
            initial={{ y: 18, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 18, scale: 0.98, opacity: 0 }}
            className="relative w-full max-w-md rounded-3xl border border-yellow-400/70 bg-black/55 p-6 text-white shadow-[0_0_60px_rgba(168,85,247,0.55)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-white font-black text-lg">
                  VOCÊ GANHOU UM PRESENTE! 🎁
                </p>
                <p className="text-white/80 font-bold text-sm mt-2">
                  Cupom {coupon.code}
                </p>
                <p className="text-white font-black text-2xl mt-2">
                  {coupon.headline}
                </p>
                <p className="mt-3 font-black text-base" style={{ color: "#25c522ff" }}>
                  Economia: - {formatBRL(coupon.discount)}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <AnimatePresence mode="popLayout">
                {isConfirmed ? (
                  <motion.div
                    key="confirmed"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="w-full py-4 rounded-2xl bg-[#25c522ff] text-black font-black text-lg flex items-center justify-center gap-3"
                  >
                    <Check size={22} /> Desconto ativado
                  </motion.div>
                ) : (
                  <motion.button
                    key="activate"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onActivate?.(coupon.code);
                      setIsConfirmed(true);
                      window.setTimeout(() => onClose?.(), 900);
                    }}
                    className="w-full py-4 rounded-2xl font-black text-lg text-black"
                    style={{
                      backgroundColor: "#25c522ff",
                      boxShadow: "0 0 40px rgba(37,197,34,0.25)",
                      animation: "sitariPulse 1.2s ease-in-out infinite",
                    }}
                  >
                    ATIVAR DESCONTO AGORA
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
