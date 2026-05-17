import { CATEGORIES } from "../logic/menu";

type Props = {
  active: string;
  onChange: (category: string) => void;
};

export function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="px-4 py-2 overflow-x-auto no-scrollbar flex gap-2">
      {CATEGORIES.filter((cat) => cat !== "Bebidas").map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            active === cat
              ? "bg-[#145a2c] text-white"
              : "bg-black/5 border border-red-500/20 text-white/85"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
