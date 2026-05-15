import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
    return { ok: false, code: "", reason: "Digite um cupom." };
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

export function GlassCoupon({ subtotal, method, appliedCode, onApply }) {
  const [input, setInput] = useState(appliedCode || "");
  const [alert, setAlert] = useState(null);

  const activeCode = normalizeCode(appliedCode);
  const inputCode = normalizeCode(input);

  const evaluation = useMemo(() => {
    const ok = validateCoupon(subtotal, method, inputCode);
    const discount = ok.ok ? calculateDiscount(subtotal, method, inputCode) : 0;
    return { ...ok, discount };
  }, [subtotal, method, inputCode]);

  const activeDiscount = useMemo(() => {
    if (!activeCode) return 0;
    return calculateDiscount(subtotal, method, activeCode);
  }, [subtotal, method, activeCode]);

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm backdrop-blur-xl ${
        activeCode
          ? "bg-white/70 border-yellow-400/70"
          : "bg-white/60 border-red-500/20"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
            Cupom
          </p>
          <p className="text-black font-black text-lg leading-tight">
            Aplicar desconto
          </p>
        </div>
        {activeCode && activeDiscount > 0 && (
          <div className="text-right">
            <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
              Economizou
            </p>
            <p className="font-black text-base" style={{ color: "#25c522ff" }}>
              - {formatBRL(activeDiscount)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex: PIZZA10"
          className={`flex-1 bg-black/5 rounded-xl px-4 py-3 text-sm font-bold outline-none border ${
            activeCode ? "border-yellow-400/60" : "border-red-500/20"
          } focus:border-[#25c522ff]`}
        />
        <button
          onClick={() => {
            if (!inputCode) {
              onApply({ code: "", discount: 0 });
              setAlert({
                type: "info",
                message: "Cupom removido.",
                key: Date.now(),
              });
              return;
            }

            if (!evaluation.ok) {
              onApply({ code: "", discount: 0 });
              setAlert({
                type: "error",
                message: evaluation.reason || "Não foi possível aplicar o cupom.",
                key: Date.now(),
              });
              return;
            }

            onApply({ code: evaluation.code, discount: evaluation.discount });
            setAlert({
              type: "success",
              message: `Cupom ${evaluation.code} aplicado!`,
              key: Date.now(),
            });
          }}
          className="px-5 py-3 rounded-xl bg-black text-white font-black"
        >
          Aplicar
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {alert && (
          <motion.div
            key={alert.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`mt-3 rounded-xl border px-4 py-3 text-sm font-bold ${
              alert.type === "success"
                ? "bg-[#25c522ff]/10 border-[#25c522ff]/40 text-black"
                : alert.type === "info"
                  ? "bg-black/5 border-black/10 text-black/70"
                  : "bg-purple-500/10 border-purple-500/30 text-black"
            }`}
          >
            {alert.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!evaluation.ok &&
          typeof evaluation.minSubtotal === "number" &&
          typeof evaluation.progress === "number" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-black/60">
                  {evaluation.reason}
                </p>
                <p className="text-[10px] font-bold text-black/40 whitespace-nowrap">
                  {formatBRL(subtotal)} / {formatBRL(evaluation.minSubtotal)}
                </p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-black/10 overflow-hidden border border-purple-500/20">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round(evaluation.progress * 100)}%`,
                    background:
                      "linear-gradient(90deg, rgba(168,85,247,1) 0%, rgba(236,72,153,1) 100%)",
                    boxShadow: "0 0 18px rgba(168,85,247,0.55)",
                  }}
                />
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}

