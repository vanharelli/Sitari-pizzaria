import { motion } from "framer-motion";

export function IngredientChip({ label, color, index }) {
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
