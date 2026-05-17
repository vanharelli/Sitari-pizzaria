import { motion } from "framer-motion";

type Props = {
  label: string;
  color: string;
  index: number;
};

export function IngredientChip({ label, color, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="px-3 py-1.5 rounded-full text-[10px] font-bold border"
      style={{ background: `${color}10`, borderColor: `${color}30`, color: color }}
    >
      {label}
    </motion.div>
  );
}
