import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { IngredientChip } from "./IngredientChip";
import { getPizzaImage } from "../data/menu";

const SIZE_LABEL = {
  M: "Média",
  G: "Grande",
};

export function ProductModal({ pizza, onClose, onAdd }) {
  const [sizeKey, setSizeKey] = useState("");
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [added, setAdded] = useState(false);

  const toggleExtra = (extra) =>
    setSelectedExtras((prev) =>
      prev.find((e) => e.name === extra.name)
        ? prev.filter((e) => e.name !== extra.name)
        : [...prev, extra]
    );

  const totalPrice =
    (pizza.sizes?.[sizeKey] ?? 0) +
    selectedExtras.reduce((s, e) => s + e.price, 0);

  const handleAdd = () => {
    onAdd({
      name: pizza.name,
      size: SIZE_LABEL[sizeKey] ?? sizeKey,
      sizeKey,
      price: pizza.sizes?.[sizeKey] ?? 0,
      extras: selectedExtras,
      imageUrl: getPizzaImage(pizza),
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full max-w-lg bg-white rounded-t-3xl border-t border-red-500/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="h-[40dvh] relative flex items-center justify-center"
          style={{
            background: `radial-gradient(circle at center, ${pizza.glowColor}30, transparent)`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/70 border border-red-500/30 flex items-center justify-center text-black"
          >
            <X size={20} />
          </button>
          <img
            src={getPizzaImage(pizza)}
            alt={pizza.name}
            className="h-44 w-44 object-contain drop-shadow-[0_0_50px_rgba(37,197,34,0.25)]"
            draggable="false"
          />
        </div>

        <div className="p-6 space-y-6 max-h-[55dvh] overflow-y-auto no-scrollbar">
          <div>
            <h2 className="text-2xl font-black text-black">{pizza.name}</h2>
            <p className="text-black/60 text-sm">{pizza.description}</p>
          </div>

          <div className="flex gap-2">
            {(pizza.ingredients ?? []).map((ing, i) => (
              <IngredientChip
                key={ing}
                label={ing}
                color={pizza.glowColor}
                index={i}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {["M", "G"].map((s) => (
              <button
                key={s}
                onClick={() => setSizeKey(s)}
                className={`py-3 rounded-xl border transition-all ${
                  sizeKey === s
                    ? "bg-[#25c522ff]/20 border-[#25c522ff] text-black"
                    : "bg-black/5 border-red-500/20 text-black/60"
                }`}
              >
                <div className="text-xs font-bold">{SIZE_LABEL[s]}</div>
                <div className="text-[10px]">
                  R${(pizza.sizes?.[s] ?? 0).toFixed(2).replace(".", ",")}
                </div>
              </button>
            ))}
          </div>

          {(pizza.extras ?? []).length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">
                Adicionais
              </p>
              {(pizza.extras ?? []).map((extra) => (
                <button
                  key={extra.name}
                  onClick={() => toggleExtra(extra)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    selectedExtras.find((e) => e.name === extra.name)
                      ? "bg-[#25c522ff]/10 border-[#25c522ff]/60"
                      : "bg-black/5 border-red-500/20"
                  }`}
                >
                  <span className="text-black/70 text-sm">{extra.name}</span>
                  <span className="text-[#25c522ff] font-bold text-sm">
                    +R$ {extra.price.toFixed(2).replace(".", ",")}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-red-500/20">
          <div className="flex justify-between items-center mb-4">
            <span className="text-black/40 font-bold">Total</span>
            <span className="text-black text-2xl font-black">
              R$ {totalPrice.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <button
            onClick={handleAdd}
            disabled={!sizeKey || added}
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all ${
              !sizeKey
                ? "bg-black/10 text-black/40"
                : added
                  ? "bg-green-600"
                  : "bg-[#25c522ff] text-black shadow-[0_0_20px_rgba(37,197,34,0.35)]"
            }`}
          >
            {!sizeKey ? "Escolha o tamanho" : added ? "Adicionado!" : "Adicionar ao Pedido"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
