import { Star } from "lucide-react";

type Props = {
  rating: number;
};

export function StarRating({ rating }: Props) {
  return (
    <div className="flex items-center gap-1">
      <Star size={11} className="fill-amber-400 text-amber-400" />
      <span className="text-amber-400 text-xs font-bold">{rating}</span>
    </div>
  );
}
