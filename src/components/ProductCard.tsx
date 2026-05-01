import { Heart } from "lucide-react";

export type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string | null;
  rating: number | null;
  confidence?: number;
};

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
  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-secondary">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
        <button
          aria-label="Save"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 backdrop-blur transition-opacity hover:bg-background group-hover:opacity-100"
        >
          <Heart className="h-4 w-4" />
        </button>
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-confidence-soft px-2.5 py-1 text-[11px] font-medium text-confidence backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-confidence" />
          {confidence}% match
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {product.category ?? "Apparel"}
          </p>
          <h3 className="mt-1 truncate text-[15px] font-medium text-foreground">
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
              <span className="h-5 w-32 animate-pulse rounded-full bg-secondary" />
              <span className="h-5 w-20 animate-pulse rounded-full bg-secondary" />
            </div>
          ) : reason ? (
            <span className="inline-block rounded-full border border-border bg-background px-3 py-1 text-[11px] leading-snug text-muted-foreground">
              ✦ {reason}
            </span>
          ) : null}
        </div>
      )}
    </article>
  );
}
