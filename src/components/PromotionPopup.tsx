import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import type { PromoOffer } from "../logic/promotions";

function formatBRL(value: number) {
  const n = Number.isFinite(value) ? value : 0;
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

type Props = {
  open: boolean;
  coupon: PromoOffer | null;
  onActivate?: (code: string) => void;
  onClose?: () => void;
};

export function PromotionPopup({ open, coupon, onActivate, onClose }: Props) {
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
