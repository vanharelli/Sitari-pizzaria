import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { CartItem } from "../logic/useCart";
import { getPizzaImage } from "../logic/menu";

const SIZE_LABEL: Record<string, string> = {
  M: "Média",
  G: "Grande",
  U: "Unidade",
};

type ExtraItem = {
  name: string;
  price: number;
};

type Pizza = {
  id: number;
  name: string;
  category: string;
  description: string;
  emoji: string;
  glowColor: string;
  sizes: Record<string, number>;
  extras?: ExtraItem[];
  imageUrl?: string;
};

type AddToCartItem = Omit<CartItem, "cartId" | "qty" | "itemKey">;

type Props = {
  pizza: Pizza;
  allPizzas?: Pizza[];
  onClose: () => void;
  onAdd: (item: AddToCartItem) => void;
};

export function ProductModal({ pizza, allPizzas = [], onClose, onAdd }: Props) {
  const [sizeKey, setSizeKey] = useState<string>("");
  const [flavorsCount, setFlavorsCount] = useState<number>(1);
  const [flavorIds, setFlavorIds] = useState<number[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<ExtraItem[]>([]);
  const [added, setAdded] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [pickFlavorIndex, setPickFlavorIndex] = useState<number>(1);

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
    setStep(defaultSizeKey ? 2 : 1);
    setPickFlavorIndex(1);
  }, [pizza?.id, sizeOptions]);

  const flavorCandidates = useMemo(() => {
    if (!pizza) return [] as Pizza[];
    if (!Array.isArray(allPizzas) || allPizzas.length === 0) return [pizza];
    return allPizzas
      .filter((p) => p && p.category === pizza.category)
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [allPizzas, pizza]);

  const flavorsById = useMemo(() => {
    const m = new Map<number, Pizza>();
    flavorCandidates.forEach((p) => {
      if (p?.id) m.set(p.id, p);
    });
    return m;
  }, [flavorCandidates]);

  const baseId = pizza?.id;
  const safeFlavorIds = useMemo(() => {
    if (!baseId) return [] as number[];
    const current = Array.isArray(flavorIds) ? flavorIds : [];
    const next = [baseId, ...current.slice(1)];
    while (next.length < 4) next.push(0);
    return next.slice(0, 4);
  }, [flavorIds, baseId]);

  const selectedFlavors = useMemo(() => {
    return safeFlavorIds
      .slice(0, flavorsCount)
      .map((id) => flavorsById.get(id))
      .filter((p): p is Pizza => Boolean(p));
  }, [safeFlavorIds, flavorsCount, flavorsById]);

  const setFlavorsCountSafe = (next: number) => {
    const n = Math.max(1, Math.min(4, Number(next) || 1));
    setFlavorsCount(n);
    setPickFlavorIndex(1);
    if (n >= 2) setStep(3);
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

  const setFlavorAtIndex = (index: number, nextId: number) => {
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

  const toggleExtra = (extra: ExtraItem) =>
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

  const flavorCandidatesNoBase = useMemo(() => {
    return flavorCandidates.filter((p) => p && p.id !== baseId);
  }, [flavorCandidates, baseId]);

  const selectFlavorAndAdvance = (id: number) => {
    const idx = pickFlavorIndex;
    setFlavorAtIndex(idx, id);
    if (idx + 1 < flavorsCount) {
      setPickFlavorIndex(idx + 1);
      return;
    }
    setStep(2);
  };

  const handleAdd = () => {
    const flavorsLabel = selectedFlavors.map((p) => p.name).filter(Boolean);
    const finalFlavorsCount = Math.max(1, Math.min(4, flavorsCount));
    const displayName =
      finalFlavorsCount > 1 ? `Pizza ${finalFlavorsCount} Sabores` : pizza.name;

    onAdd({
      name: displayName,
      emoji: pizza.emoji,
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
        className="relative w-full max-w-lg bg-white rounded-t-3xl border-t border-red-500/20 overflow-hidden flex flex-col max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative flex items-center justify-center shrink-0 h-[22dvh] sm:h-[26dvh] max-h-[260px]"
          style={{
            background: `radial-gradient(circle at center, ${pizza.glowColor}30, transparent)`,
          }}
        >
          <img
            src={getPizzaImage(pizza)}
            alt={pizza.name}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/70 border border-red-500/30 flex items-center justify-center text-black"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-3 sm:p-4 space-y-3 sm:space-y-4">
          <div>
            <h2 className="text-lg font-black text-black">{pizza.name}</h2>
            <p
              className="text-black/60 text-xs leading-snug"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {pizza.description}
            </p>
          </div>

          {!isDrink && (
            <>
              {step === 1 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">
                    Etapa 1
                  </p>
                  <h3 className="text-black font-black text-sm">Qual o tamanho da pizza?</h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    {sizeOptions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSizeKey(s)}
                        className={`py-2 rounded-xl border transition-all ${
                          sizeKey === s
                            ? "bg-[#145a2c]/20 border-[#145a2c] text-black"
                            : "bg-black/5 border-red-500/20 text-black/60"
                        }`}
                      >
                        <div className="text-[10px] font-black">{SIZE_LABEL[s] ?? s}</div>
                        <div className="text-[9px] leading-none mt-0.5">
                          R${(pizza.sizes?.[s] ?? 0).toFixed(2).replace(".", ",")}
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!sizeKey}
                    className={`w-full py-2 rounded-2xl font-black text-sm transition-all ${
                      !sizeKey ? "bg-black/10 text-black/40" : "bg-[#145a2c] text-white"
                    }`}
                  >
                    Continuar
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">
                    Etapa 2
                  </p>
                  <h3 className="text-black font-black text-sm">Quantos sabores será?</h3>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((n) => (
                      <button
                        key={n}
                        onClick={() => setFlavorsCountSafe(n)}
                        className={`py-2 rounded-xl border font-black text-sm transition-all ${
                          flavorsCount === n
                            ? "bg-[#145a2c]/20 border-[#145a2c] text-black"
                            : "bg-black/5 border-red-500/20 text-black/60"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  <p className="text-black/60 text-[11px] font-bold">Escolha de 1 a 4 sabores.</p>

                  <button
                    onClick={() => setStep(1)}
                    className="w-full py-2 rounded-2xl bg-white border border-red-500/20 text-black font-black text-xs"
                  >
                    Voltar
                  </button>
                </div>
              )}
            </>
          )}

          {isDrink && (
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
                        ? "bg-[#145a2c]/20 border-[#145a2c] text-black"
                        : "bg-black/5 border-red-500/20 text-black/60"
                    }`}
                  >
                    <div className="text-[11px] font-black">{SIZE_LABEL[s] ?? s}</div>
                    <div className="text-[9px]">
                      R${(pizza.sizes?.[s] ?? 0).toFixed(2).replace(".", ",")}
                    </div>
                  </button>
                ))}
              </div>
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
                      ? "bg-[#145a2c]/10 border-[#145a2c]/60"
                      : "bg-black/5 border-red-500/20"
                  }`}
                >
                  <span className="text-black/70 text-sm">{extra.name}</span>
                  <span className="text-[#145a2c] font-bold text-sm">
                    +R$ {extra.price.toFixed(2).replace(".", ",")}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-3 bg-black/35 backdrop-blur-sm"
            onClick={() => setStep(2)}
          >
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="w-full max-w-md max-h-[86dvh] rounded-3xl bg-white/95 border border-red-500/20 overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b border-red-500/15 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                    Etapa 3
                  </p>
                  <p className="text-black font-black text-sm">
                    Escolha o {pickFlavorIndex + 1}º sabor
                  </p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="px-3 py-2 rounded-xl bg-white border border-red-500/20 text-black font-black text-xs"
                >
                  Voltar
                </button>
              </div>

              <div className="max-h-[calc(86dvh-64px)] overflow-y-auto no-scrollbar p-3 space-y-2">
                {flavorCandidatesNoBase.map((p) => {
                  const selectedId = safeFlavorIds[pickFlavorIndex];
                  const isSelected = selectedId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectFlavorAndAdvance(p.id)}
                      className="w-full text-left"
                    >
                      <div
                        className={`relative overflow-hidden rounded-2xl border transition-all ${
                          isSelected
                            ? "border-[#145a2c]/70 ring-2 ring-[#145a2c]/25"
                            : "border-red-500/15 hover:border-red-500/30"
                        }`}
                      >
                        <div className="relative h-[92px]">
                          <img
                            src={getPizzaImage(p)}
                            alt={p.name}
                            className="absolute inset-0 h-full w-full object-cover"
                            draggable={false}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />
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
            </motion.div>
          </motion.div>
        )}

        <div className="shrink-0 p-4 bg-white border-t border-red-500/20">
          <div className="flex justify-between items-center mb-3">
            <span className="text-black/40 font-bold">Total</span>
            <span className="text-black text-xl font-black">
              R$ {totalPrice.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <button
            onClick={handleAdd}
            disabled={
              !sizeKey || added || (flavorsCount > 1 && selectedFlavors.length !== flavorsCount)
            }
            className={`w-full py-3 rounded-2xl font-black text-white transition-all ${
              !sizeKey || (flavorsCount > 1 && selectedFlavors.length !== flavorsCount)
                ? "bg-black/10 text-black/40"
                : added
                  ? "bg-green-600"
                  : "bg-[#145a2c] text-white shadow-[0_0_20px_rgba(20,90,44,0.35)]"
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
