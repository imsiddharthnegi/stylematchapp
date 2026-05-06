import { Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSavedItems } from "@/hooks/useSavedItems";
import { useCountUp, useInView } from "@/hooks/useCountUp";

export type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string | null;
  rating: number | null;
  tags?: string[] | null;
  created_at?: string | null;
  confidence?: number;
  brand?: string | null;
};

function ConfidenceRing({ value, animate }: { value: number; animate: boolean }) {
  const animated = useCountUp(value, 1200, animate);
  const size = 52;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const high = value >= 95;
  const mid = value >= 80 && value < 95;
  const color = high
    ? "var(--confidence)"
    : mid
      ? "var(--confidence-mid)"
      : "var(--primary)";
  const offset = c - (animated / 100) * c;
  return (
    <div
      className="absolute bottom-3 left-3 flex items-center justify-center rounded-full bg-black/55 backdrop-blur-md"
      style={{ width: size, height: size }}
      aria-label={`${value}% match`}
    >
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 80ms linear", filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="flex flex-col items-center leading-none" style={{ color }}>
        <span className="text-[12px] font-semibold tabular-nums">
          {Math.round(animated)}
        </span>
        <span className="mt-0.5 text-[7px] uppercase tracking-wider opacity-80">
          match
        </span>
      </div>
    </div>
  );
}

export function ProductCard({
  product,
  reason,
  reasonLoading,
}: {
  product: Product;
  reason?: string;
  reasonLoading?: boolean;
}) {
  const confidence = product.confidence ?? Math.round(78 + Math.random() * 20);
  const { ref, inView } = useInView<HTMLElement>();
  const { isSaved, toggle } = useSavedItems();
  const saved = isSaved(product.id);
  const [popping, setPopping] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wasSaved = saved;
    setPopping(true);
    setTimeout(() => setPopping(false), 480);
    await toggle(product.id);
    if (wasSaved) {
      toast("Removed", { description: product.name });
    } else {
      toast.success("Saved", { description: product.name });
    }
  };

  const aspectVariants = ["aspect-[4/5]", "aspect-[3/4]", "aspect-[4/6]", "aspect-[5/6]"];
  const aspect = aspectVariants[product.id.charCodeAt(0) % aspectVariants.length];

  return (
    <article
      ref={ref}
      className={`sm-card-3d group mb-6 flex cursor-pointer break-inside-avoid flex-col ${
        inView ? "sm-reveal-in" : "sm-reveal-pre"
      }`}
    >
      <div className={`relative ${aspect} overflow-hidden rounded-xl bg-secondary ring-1 ring-white/5`}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.15]"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
        <button
          aria-label={saved ? "Remove from saved" : "Save"}
          aria-pressed={saved}
          onClick={handleSave}
          className={`sm-focus absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-all duration-300 ease-out ${
            saved
              ? "bg-gradient-primary text-white opacity-100 shadow-glow"
              : "bg-black/40 text-white opacity-0 hover:bg-black/60 group-hover:opacity-100 focus-visible:opacity-100"
          }`}
        >
          <Heart
            className={`h-4 w-4 ${popping ? "sm-heart-bounce" : ""}`}
            fill={saved ? "currentColor" : "none"}
          />
        </button>
        <ConfidenceRing value={confidence} animate={inView} />
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {product.category ?? "Apparel"}
          </p>
          <h3 className="mt-1 truncate text-[15px] font-medium text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </div>
        <p className="shrink-0 text-[15px] font-medium tabular-nums text-foreground">
          ${product.price.toFixed(0)}
        </p>
      </div>

      {(reasonLoading || reason) && (
        <div className="mt-3 min-h-[1.5rem]">
          {reasonLoading ? (
            <div className="flex flex-wrap gap-1.5">
              <span className="sm-shimmer h-5 w-32 rounded-full" />
              <span className="sm-shimmer h-5 w-20 rounded-full" />
            </div>
          ) : reason ? (
            <span className="inline-block animate-[sm-fade-in_0.4s_ease-out_both] rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] leading-snug text-muted-foreground">
              ✦ {reason}
            </span>
          ) : null}
        </div>
      )}
    </article>
  );
}
