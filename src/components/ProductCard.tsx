import { Heart, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSavedItems } from "@/hooks/useSavedItems";

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

export function ProductCard({
  product,
  reason,
}: {
  product: Product;
  reason?: string;
  reasonLoading?: boolean;
}) {
  const confidence = product.confidence ?? Math.round(78 + Math.random() * 20);
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
    if (wasSaved) toast("Removed", { description: product.name });
    else toast.success("Saved", { description: product.name });
  };

  return (
    <article className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_50px_-15px_color-mix(in_oklab,var(--primary)_35%,transparent)]">
      <div className="relative h-[280px] w-full overflow-hidden bg-secondary">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}

        {/* Subtle gradient veil for legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70" />

        {/* Match badge — top-left, floating on image */}
        <span
          className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md ring-1 ring-white/10"
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#10b981", boxShadow: "0 0 8px #10b981" }} />
          <span className="tabular-nums">{confidence}%</span>
          <span className="text-white/70">match</span>
        </span>

        {/* Save button - hover only */}
        <button
          aria-label={saved ? "Remove from saved" : "Save"}
          aria-pressed={saved}
          onClick={handleSave}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md ring-1 ring-white/10 transition-all duration-300 ease-out hover:bg-black/75 hover:scale-110 ${
            saved
              ? "opacity-100 text-rose-400"
              : "opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 focus-visible:opacity-100"
          }`}
        >
          <Heart
            className={`h-4 w-4 ${popping ? "sm-heart-bounce" : ""}`}
            fill={saved ? "currentColor" : "none"}
          />
        </button>

        {/* "Why this matches you" overlay - slides up on hover */}
        {reason && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 text-[12px] leading-snug text-white transition-transform duration-500 ease-out group-hover:translate-y-0">
            <p className="font-semibold tracking-wide text-emerald-400">✦ Why this matches you</p>
            <p className="mt-1 text-white/90">{reason}</p>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {product.category ?? "Apparel"}
            </p>
            <h3 className="mt-1 truncate text-[15px] font-semibold leading-tight text-foreground">
              {product.name}
            </h3>
            {product.brand && (
              <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                {product.brand}
              </p>
            )}
          </div>
          <p className="shrink-0 text-[15px] font-semibold tabular-nums text-foreground">
            ${product.price.toFixed(0)}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/50 pt-3">
          <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="tabular-nums font-medium text-foreground">
              {(product.rating ?? 4.5).toFixed(1)}
            </span>
            <span className="text-muted-foreground/70">·</span>
            <span className="text-[11px] text-muted-foreground/80">In stock</span>
          </div>
          <span className="text-[11px] font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            View →
          </span>
        </div>
      </div>
    </article>
  );
}
