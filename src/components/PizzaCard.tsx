import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { StarRating } from "./StarRating";
import { getPizzaImage } from "../logic/menu";

type Pizza = {
  id: number;
  name: string;
  category: string;
  description: string;
  glowColor: string;
  tag: string;
  tagColor: string;
  rating: number;
  sizes: Record<string, number>;
  imageUrl?: string;
};

type Props = {
  pizza: Pizza;
  onSelect: (pizza: Pizza) => void;
  sizeKey?: string;
};

export function PizzaCard({ pizza, onSelect, sizeKey }: Props) {
  const prices = Object.values(pizza.sizes ?? {}).filter(
    (v) => typeof v === "number" && Number.isFinite(v)
  );
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const price = sizeKey ? pizza.sizes?.[sizeKey] ?? 0 : minPrice;
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(pizza)}
      className="relative rounded-2xl overflow-hidden bg-white border border-red-500/20 shadow-sm"
    >
      <div
        className="h-40 sm:h-44 flex items-center justify-center relative"
        style={{
          background: `radial-gradient(circle, ${pizza.glowColor}20, transparent)`,
        }}
      >
        <img
          src={getPizzaImage(pizza)}
          alt={pizza.name}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div
          className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black"
          style={{ background: pizza.tagColor, color: "#fff" }}
        >
          {pizza.tag}
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white font-black text-base leading-tight drop-shadow">
            {pizza.name}
          </p>
        </div>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-black font-bold text-sm truncate">{pizza.name}</h3>
          <StarRating rating={pizza.rating} />
        </div>
        <p className="text-black/50 text-[10px] line-clamp-2 mb-3 h-7">
          {pizza.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-black font-black text-sm">
            {sizeKey ? "R$ " : "A partir de R$ "}
            {price.toFixed(2).replace(".", ",")}
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#145a2c] flex items-center justify-center text-white">
            <Plus size={16} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
