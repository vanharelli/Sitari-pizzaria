import { CATEGORIES } from "../logic/menu";

export function CategoryFilter({ active, onChange }) {
  return (
    <div className="px-4 py-2 overflow-x-auto no-scrollbar flex gap-2">
      {CATEGORIES.filter((cat) => cat !== "Bebidas").map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            active === cat
              ? "bg-[#145a2c] text-white"
              : "bg-white/80 border border-red-500/20 text-white"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
