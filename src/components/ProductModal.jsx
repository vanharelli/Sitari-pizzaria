import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { getPizzaImage } from "../data/menu";

const SIZE_LABEL = {
  M: "Média",
  G: "Grande",
};

export function ProductModal({ pizza, allPizzas = [], onClose, onAdd }) {
  const [sizeKey, setSizeKey] = useState("");
  const [flavorsCount, setFlavorsCount] = useState(1);
  const [flavorIds, setFlavorIds] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setSizeKey("");
    setSelectedExtras([]);
    setAdded(false);
    setFlavorsCount(1);
    setFlavorIds([pizza?.id].filter(Boolean));
  }, [pizza?.id]);

  const flavorCandidates = useMemo(() => {
    if (!pizza) return [];
    if (!Array.isArray(allPizzas) || allPizzas.length === 0) return [pizza];
    return allPizzas
      .filter((p) => p && p.category === pizza.category)
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [allPizzas, pizza]);

  const flavorsById = useMemo(() => {
    const m = new Map();
    flavorCandidates.forEach((p) => {
      if (p?.id) m.set(p.id, p);
    });
    return m;
  }, [flavorCandidates]);

  const baseId = pizza?.id;
  const safeFlavorIds = useMemo(() => {
    const initial = Array.isArray(flavorIds) ? flavorIds : [];
    const withBase = baseId ? [baseId, ...initial.filter((id) => id !== baseId)] : initial;
    return withBase.filter(Boolean);
  }, [flavorIds, baseId]);

  const selectedFlavors = useMemo(() => {
    return safeFlavorIds
      .map((id) => flavorsById.get(id))
      .filter(Boolean);
  }, [safeFlavorIds, flavorsById]);

  const setFlavorsCountSafe = (next) => {
    const n = Math.max(1, Math.min(4, Number(next) || 1));
    setFlavorsCount(n);
    setFlavorIds((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      const withBase = baseId ? [baseId, ...current.filter((id) => id !== baseId)] : current;
      const trimmed = withBase.slice(0, n);
      return trimmed.length > 0 ? trimmed : [baseId].filter(Boolean);
    });
  };

  const toggleFlavor = (id) => {
    if (!id) return;
    if (id === baseId) return;
    setFlavorIds((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      const withBase = baseId ? [baseId, ...current.filter((x) => x !== baseId)] : current;
      const exists = withBase.includes(id);
      if (exists) {
        return withBase.filter((x) => x !== id);
      }
      if (withBase.length >= flavorsCount) return withBase;
      return [...withBase, id];
    });
  };

  const removeFlavor = (id) => {
    if (!id) return;
    if (id === baseId) return;
    setFlavorIds((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      const withBase = baseId ? [baseId, ...current.filter((x) => x !== baseId)] : current;
      return withBase.filter((x) => x !== id);
    });
  };

  const fillFlavor = (id) => {
    if (!id) return;
    if (id === baseId) return;
    setFlavorIds((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      const withBase = baseId ? [baseId, ...current.filter((x) => x !== baseId)] : current;
      if (withBase.includes(id)) return withBase;
      if (withBase.length >= flavorsCount) return withBase;
      return [...withBase, id];
    });
  };

  const toggleExtra = (extra) =>
    setSelectedExtras((prev) =>
      prev.find((e) => e.name === extra.name)
        ? prev.filter((e) => e.name !== extra.name)
        : [...prev, extra]
    );

  const basePrice = selectedFlavors.reduce((max, p) => {
    const price = p?.sizes?.[sizeKey] ?? 0;
    return price > max ? price : max;
  }, 0);

  const totalPrice = basePrice + selectedExtras.reduce((s, e) => s + e.price, 0);

  const handleAdd = () => {
    const flavorsLabel = selectedFlavors.map((p) => p.name).filter(Boolean);
    const finalFlavorsCount = Math.max(1, Math.min(4, flavorsCount));
    const displayName =
      finalFlavorsCount > 1 ? `Pizza ${finalFlavorsCount} Sabores` : pizza.name;
    onAdd({
      name: displayName,
      flavorsCount: finalFlavorsCount,
      flavors: flavorsLabel.length > 0 ? flavorsLabel : [pizza.name],
      size: SIZE_LABEL[sizeKey] ?? sizeKey,
      sizeKey,
      price: basePrice,
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
        className="w-full max-w-lg bg-white rounded-t-3xl border-t border-red-500/20 overflow-hidden flex flex-col max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative flex items-center justify-center shrink-0 h-[28dvh] sm:h-[34dvh] max-h-[340px]"
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

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-black">{pizza.name}</h2>
            <p className="text-black/60 text-sm">{pizza.description}</p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">
              Tamanho
            </p>
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
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">
              Sabores
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setFlavorsCountSafe(n)}
                  className={`py-3 rounded-xl border font-black text-sm transition-all ${
                    flavorsCount === n
                      ? "bg-[#25c522ff]/20 border-[#25c522ff] text-black"
                      : "bg-black/5 border-red-500/20 text-black/60"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            {flavorsCount > 1 && (
              <>
                <p className="text-xs font-bold text-black/60">
                  Selecione {flavorsCount} sabores ({selectedFlavors.length}/
                  {flavorsCount})
                </p>
                <div className="space-y-2">
                  {Array.from({ length: flavorsCount }).map((_, idx) => {
                    const slotLabel = `Sabor ${idx + 1}`;
                    const slotId = safeFlavorIds[idx];
                    const slotPizza = slotId ? flavorsById.get(slotId) : null;
                    const isBase = idx === 0;
                    return (
                      <div
                        key={slotLabel}
                        className="flex items-center justify-between gap-3 rounded-xl bg-black/5 border border-red-500/20 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="text-[10px] font-black text-black/40 uppercase tracking-widest">
                            {slotLabel}
                          </div>
                          <div className="font-black text-sm text-black whitespace-normal break-words leading-tight">
                            {slotPizza?.name ||
                              (isBase ? pizza.name : "Escolha um sabor abaixo")}
                          </div>
                        </div>
                        {!isBase && slotId && (
                          <button
                            onClick={() => removeFlavor(slotId)}
                            className="shrink-0 px-3 py-2 rounded-xl bg-white border border-red-500/20 text-black/70 font-black text-xs"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {flavorCandidates.map((p) => {
                    const isBase = p.id === baseId;
                    const isSelected = safeFlavorIds.includes(p.id);
                    const isFull =
                      !isSelected && selectedFlavors.length >= flavorsCount;
                    return (
                      <button
                        key={p.id}
                        onClick={() =>
                          isSelected ? removeFlavor(p.id) : fillFlavor(p.id)
                        }
                        disabled={isBase || isFull}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-[#25c522ff]/15 border-[#25c522ff]/70 text-black"
                            : "bg-black/5 border-red-500/20 text-black/70"
                        } ${isBase || isFull ? "opacity-60" : ""}`}
                      >
                        <div className="font-black text-sm whitespace-normal break-words leading-tight">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-black/50">
                          {isBase
                            ? "Sabor principal"
                            : isSelected
                              ? "Selecionado (toque para remover)"
                              : "Toque para selecionar"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
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

        <div className="shrink-0 p-6 bg-white border-t border-red-500/20">
          <div className="flex justify-between items-center mb-4">
            <span className="text-black/40 font-bold">Total</span>
            <span className="text-black text-2xl font-black">
              R$ {totalPrice.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <button
            onClick={handleAdd}
            disabled={
              !sizeKey ||
              added ||
              (flavorsCount > 1 && selectedFlavors.length !== flavorsCount)
            }
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all ${
              !sizeKey || (flavorsCount > 1 && selectedFlavors.length !== flavorsCount)
                ? "bg-black/10 text-black/40"
                : added
                  ? "bg-green-600"
                  : "bg-[#25c522ff] text-black shadow-[0_0_20px_rgba(37,197,34,0.35)]"
            }`}
          >
            {!sizeKey
              ? "Escolha o tamanho"
              : flavorsCount > 1 && selectedFlavors.length !== flavorsCount
                ? `Selecione ${flavorsCount} sabores`
                : added
                  ? "Adicionado!"
                  : "Adicionar ao Pedido"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
