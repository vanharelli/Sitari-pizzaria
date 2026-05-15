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
    setFlavorIds(pizza?.id ? [pizza.id, 0, 0, 0] : []);
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
    if (!baseId) return [];
    const current = Array.isArray(flavorIds) ? flavorIds : [];
    const next = [baseId, ...current.slice(1)];
    while (next.length < 4) next.push(0);
    return next.slice(0, 4);
  }, [flavorIds, baseId]);

  const selectedFlavors = useMemo(() => {
    return safeFlavorIds
      .slice(0, flavorsCount)
      .map((id) => flavorsById.get(id))
      .filter(Boolean);
  }, [safeFlavorIds, flavorsCount, flavorsById]);

  const setFlavorsCountSafe = (next) => {
    const n = Math.max(1, Math.min(4, Number(next) || 1));
    setFlavorsCount(n);
    setFlavorIds((prev) => {
      if (!baseId) return [];
      const current = Array.isArray(prev) ? prev : [];
      const slots = [baseId, ...current.slice(1)];
      while (slots.length < 4) slots.push(0);
      slots[0] = baseId;
      for (let i = n; i < 4; i += 1) slots[i] = 0;

      for (let i = 1; i < n; i += 1) {
        const id = slots[i];
        if (!id) continue;
        if (id === baseId) slots[i] = 0;
        for (let j = i + 1; j < n; j += 1) {
          if (slots[j] === id) slots[j] = 0;
        }
      }

      return slots;
    });
  };

  const setFlavorAtIndex = (index, nextId) => {
    if (!baseId) return;
    if (index === 0) return;

    const id = nextId ? Number(nextId) : 0;
    setFlavorIds((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      const slots = [baseId, ...current.slice(1)];
      while (slots.length < 4) slots.push(0);
      slots[0] = baseId;

      if (!id) {
        slots[index] = 0;
      } else if (id === baseId) {
        slots[index] = 0;
      } else {
        for (let i = 1; i < flavorsCount; i += 1) {
          if (i !== index && slots[i] === id) slots[i] = 0;
        }
        slots[index] = id;
      }

      for (let i = flavorsCount; i < 4; i += 1) slots[i] = 0;
      return slots;
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

        <div className="flex-1 overflow-y-auto no-scrollbar p-5 sm:p-6 space-y-5 sm:space-y-6">
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
            <p className="text-black/60 text-xs font-bold">
              Quantos sabores será?
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
                        {!isBase && (
                          <select
                            value={slotId && slotId !== baseId ? String(slotId) : ""}
                            onChange={(e) => setFlavorAtIndex(idx, e.target.value)}
                            className="shrink-0 max-w-[52%] rounded-xl bg-white border border-red-500/20 px-3 py-2 text-xs font-black text-black/70 outline-none focus:border-[#25c522ff]"
                          >
                            <option value="">Selecionar</option>
                            {flavorCandidates
                              .filter((p) => p.id !== baseId)
                              .map((p) => (
                                <option key={p.id} value={String(p.id)}>
                                  {p.name}
                                </option>
                              ))}
                          </select>
                        )}
                      </div>
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
