import { Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
};

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const startedRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setValue(0);
    startedRef.current = null;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(target);
      return;
    }
    const step = (ts: number) => {
      if (startedRef.current === null) startedRef.current = ts;
      const elapsed = ts - startedRef.current;
      const t = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
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
  const animatedConfidence = useCountUp(confidence);
  const { isSaved, toggle } = useSavedItems();
  const saved = isSaved(product.id);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wasSaved = saved;
    await toggle(product.id);
    if (wasSaved) {
      toast("Removed", { description: product.name });
    } else {
      toast.success("Saved", { description: product.name });
    }
  };

  // Vary aspect ratio across cards for a masonry feel — deterministic per id
  const aspectVariants = ["aspect-[4/5]", "aspect-[3/4]", "aspect-[4/6]", "aspect-[5/6]"];
  const aspect = aspectVariants[product.id.charCodeAt(0) % aspectVariants.length];

  return (
    <article className="sm-card group mb-6 flex cursor-pointer break-inside-avoid flex-col">
      <div className={`relative ${aspect} overflow-hidden rounded-2xl bg-secondary`}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
        <button
          aria-label={saved ? "Remove from saved" : "Save"}
          aria-pressed={saved}
          onClick={handleSave}
          className={`sm-focus absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-all duration-200 active:scale-90 ${
            saved
              ? "bg-primary text-primary-foreground opacity-100"
              : "bg-background/70 text-foreground opacity-0 hover:bg-background group-hover:opacity-100 focus-visible:opacity-100"
          }`}
        >
          <Heart
            className="h-4 w-4 transition-transform"
            fill={saved ? "currentColor" : "none"}
          />
        </button>
        {confidence >= 95 ? (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-gold px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-glow">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
            <span className="tabular-nums">{animatedConfidence}%</span> match
          </div>
        ) : (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-medium text-confidence backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-confidence" />
            <span className="tabular-nums">{animatedConfidence}%</span> match
          </div>
        )}
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
