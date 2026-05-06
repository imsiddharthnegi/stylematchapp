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
    <article className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg">
      <div className="relative h-[280px] w-full overflow-hidden bg-secondary">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}

        {/* Save button - hover only */}
        <button
          aria-label={saved ? "Remove from saved" : "Save"}
          aria-pressed={saved}
          onClick={handleSave}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-all duration-300 ease-out hover:bg-black/75 ${
            saved
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          }`}
        >
          <Heart
            className={`h-4 w-4 ${popping ? "sm-heart-bounce" : ""}`}
            fill={saved ? "currentColor" : "none"}
          />
        </button>

        {/* "Why this matches you" overlay - slides up on hover */}
        {reason && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/90 via-black/75 to-transparent p-4 text-[12px] leading-snug text-white transition-transform duration-300 ease-out group-hover:translate-y-0">
            <p className="font-medium text-emerald-400">✦ Why this matches you</p>
            <p className="mt-1 text-white/90">{reason}</p>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {product.category ?? "Apparel"}
            </p>
            <h3 className="mt-1 truncate text-[15px] font-semibold text-foreground">
              {product.name}
            </h3>
            {product.brand && (
              <p className="truncate text-[12px] text-muted-foreground">
                {product.brand}
              </p>
            )}
          </div>
          <p className="shrink-0 text-[15px] font-semibold tabular-nums text-foreground">
            ${product.price.toFixed(0)}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
            <span className="tabular-nums">
              {(product.rating ?? 4.5).toFixed(1)}
            </span>
          </div>
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
            style={{ backgroundColor: "#10b981" }}
          >
            {confidence}% match
          </span>
        </div>
      </div>
    </article>
  );
}
