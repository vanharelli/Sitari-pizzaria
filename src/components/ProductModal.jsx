import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { getPizzaImage } from "../logic/menu";

const SIZE_LABEL = {
  M: "Média",
  G: "Grande",
  U: "Unidade",
};

export function ProductModal({ pizza, allPizzas = [], onClose, onAdd }) {
  const [sizeKey, setSizeKey] = useState("");
  const [flavorsCount, setFlavorsCount] = useState(1);
  const [flavorIds, setFlavorIds] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [added, setAdded] = useState(false);
  const [openFlavorIndex, setOpenFlavorIndex] = useState(null);
  const openFlavorIndexRef = useRef(null);

  const sizeOptions = useMemo(() => {
    const keys = Object.keys(pizza?.sizes || {});
    if (keys.length > 0) return keys;
    return ["M", "G"];
  }, [pizza?.sizes]);

  const isDrink = pizza?.category === "Bebidas";

  useEffect(() => {
    const defaultSizeKey = sizeOptions.length === 1 ? sizeOptions[0] : "";
    setSizeKey(defaultSizeKey);
    setSelectedExtras([]);
    setAdded(false);
    setFlavorsCount(1);
    setFlavorIds(pizza?.id ? [pizza.id, 0, 0, 0] : []);
    setOpenFlavorIndex(null);
    openFlavorIndexRef.current = null;
  }, [pizza?.id, sizeOptions]);

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
    setOpenFlavorIndex(null);
    openFlavorIndexRef.current = null;
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

  useEffect(() => {
    openFlavorIndexRef.current = openFlavorIndex;
  }, [openFlavorIndex]);

  useEffect(() => {
    if (openFlavorIndexRef.current == null) return;
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      setOpenFlavorIndex(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openFlavorIndex]);

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

          <div className="space-y-1.5">
            <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest">
              Tamanho
            </p>
            <div className="grid grid-cols-2 gap-1.5">
            {sizeOptions.map((s) => (
              <button
                key={s}
                onClick={() => setSizeKey(s)}
                className={`py-2.5 rounded-xl border transition-all ${
                  sizeKey === s
                    ? "bg-[#25c522ff]/20 border-[#25c522ff] text-black"
                    : "bg-black/5 border-red-500/20 text-black/60"
                }`}
              >
                <div className="text-[11px] font-black">
                  {SIZE_LABEL[s] ?? s}
                </div>
                <div className="text-[9px]">
                  R${(pizza.sizes?.[s] ?? 0).toFixed(2).replace(".", ",")}
                </div>
              </button>
            ))}
            </div>
          </div>

          {!isDrink && (
            <div className="space-y-2" onClick={() => setOpenFlavorIndex(null)}>
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
                      const candidates = flavorCandidates.filter(
                        (p) => p.id !== baseId
                      );
                      return (
                        <div
                          key={slotLabel}
                          className="relative flex items-center justify-between gap-3 rounded-xl bg-black/5 border border-red-500/20 px-4 py-3"
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
                            <div className="shrink-0 w-[52%] max-w-[52%]">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenFlavorIndex((prev) =>
                                    prev === idx ? null : idx
                                  );
                                }}
                                className={`w-full rounded-xl bg-white border px-3 py-2 text-xs font-black outline-none transition-colors ${
                                  openFlavorIndex === idx
                                    ? "border-[#25c522ff] text-black"
                                    : "border-red-500/20 text-black/70"
                                }`}
                              >
                                <span className="block truncate">
                                  {slotPizza?.name ? slotPizza.name : "Selecionar"}
                                </span>
                              </button>

                              {openFlavorIndex === idx && (
                                <div
                                  className="absolute right-4 top-[calc(100%+10px)] z-20 w-[min(380px,calc(100%-2rem))] rounded-2xl border border-red-500/20 bg-white/90 backdrop-blur-xl shadow-xl overflow-hidden"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="px-4 py-3 border-b border-red-500/15">
                                    <div className="text-[10px] font-black text-black/40 uppercase tracking-widest">
                                      Escolha um sabor
                                    </div>
                                    <div className="text-xs font-black text-black">
                                      {slotLabel}
                                    </div>
                                  </div>
                                  <div className="max-h-[44dvh] overflow-y-auto no-scrollbar p-3 space-y-2">
                                    {candidates.map((p) => {
                                      const isSelected = slotId === p.id;
                                      return (
                                        <button
                                          key={p.id}
                                          type="button"
                                          onClick={() => {
                                            setFlavorAtIndex(idx, p.id);
                                            setOpenFlavorIndex(null);
                                          }}
                                          className="w-full text-left"
                                        >
                                          <div
                                            className={`relative overflow-hidden rounded-2xl border transition-all ${
                                              isSelected
                                                ? "border-[#25c522ff]/70 ring-2 ring-[#25c522ff]/25"
                                                : "border-red-500/15 hover:border-red-500/30"
                                            }`}
                                          >
                                            <div className="relative h-[74px]">
                                              <img
                                                src={getPizzaImage(p)}
                                                alt={p.name}
                                                className="absolute inset-0 h-full w-full object-cover"
                                                draggable="false"
                                              />
                                              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
                                              <div className="relative p-3">
                                                <div className="text-white font-black text-sm leading-tight">
                                                  {p.name}
                                                </div>
                                                <div
                                                  className="text-white/80 text-[11px] leading-snug mt-1"
                                                  style={{
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                  }}
                                                >
                                                  {p.description}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

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
