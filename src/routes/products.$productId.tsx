import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ProductCard, type Product } from "@/components/ProductCard";
import { useSavedItems } from "@/hooks/useSavedItems";
import { getSavedPreferences } from "@/components/StyleQuiz";
import { generateProductPickReason } from "@/server/product-detail.functions";

export const Route = createFileRoute("/products/$productId")({
  component: ProductDetailPage,
  head: () => ({
    meta: [
      { title: "Product — StyleMatch" },
      {
        name: "description",
        content:
          "An AI-curated piece, with the reasoning behind why it's a smart pick for your style.",
      },
    ],
  }),
});

const SIZES = ["XS", "S", "M", "L", "XL"];
const COLOR_VARIANTS = [
  { name: "Bone", hex: "#F5F1EA" },
  { name: "Sand", hex: "#D8C9B0" },
  { name: "Charcoal", hex: "#2A2A2C" },
];

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const router = useRouter();
  const { isSaved, toggle } = useSavedItems();
  const saved = isSaved(productId);

  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [similar, setSimilar] = useState<Product[]>([]);

  const [size, setSize] = useState<string>("M");
  const [color, setColor] = useState<string>(COLOR_VARIANTS[0].name);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const [reason, setReason] = useState<string>("");
  const [reasonLoading, setReasonLoading] = useState(false);
  const [reasonError, setReasonError] = useState<string | null>(null);

  // Fetch product + similar in parallel.
  useEffect(() => {
    let cancelled = false;
    setProduct(null);
    setNotFound(false);
    setSimilar([]);

    void (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,price,image_url,category,rating,tags,created_at")
        .eq("id", productId)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setNotFound(true);
        return;
      }
      const p = data as Product;
      setProduct(p);

      // Pull similar by category, fall back to recent.
      const { data: sim } = await supabase
        .from("products")
        .select("id,name,price,image_url,category,rating,tags,created_at")
        .neq("id", p.id)
        .eq("category", p.category ?? "")
        .limit(8);
      if (cancelled) return;

      if (sim && sim.length >= 4) {
        setSimilar(sim as Product[]);
      } else {
        const { data: recent } = await supabase
          .from("products")
          .select("id,name,price,image_url,category,rating,tags,created_at")
          .neq("id", p.id)
          .order("created_at", { ascending: false })
          .limit(8);
        if (!cancelled) setSimilar((recent as Product[]) ?? []);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  // Generate "Why this pick" via Lovable AI (server function).
  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    setReason("");
    setReasonError(null);
    setReasonLoading(true);

    const prefs = getSavedPreferences();

    generateProductPickReason({
      data: {
        product: {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
        },
        preferences: prefs
          ? {
              vibe: prefs.vibe,
              colors: prefs.colors,
              priceRange: prefs.priceRange,
              fit: prefs.fit,
            }
          : null,
      },
    })
      .then((res) => {
        if (cancelled) return;
        if (res.error) setReasonError(res.error);
        setReason(res.reason ?? "");
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("[pick reason]", err);
        setReasonError("Couldn't load reasoning.");
      })
      .finally(() => {
        if (!cancelled) setReasonLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [product]);

  const confidence = useMemo(() => {
    if (!product) return 0;
    const seed =
      product.id.charCodeAt(0) + product.id.charCodeAt(product.id.length - 1);
    return 84 + (seed % 14); // 84-97
  }, [product]);

  const reviewCount = useMemo(() => {
    if (!product) return 0;
    const seed =
      product.id.charCodeAt(1) * 7 +
      product.id.charCodeAt(product.id.length - 2);
    return 40 + (seed % 480);
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    try {
      const raw = localStorage.getItem("stylematch:cart");
      const cart: { product_id: string; size: string; color: string; qty: number }[] =
        raw ? JSON.parse(raw) : [];
      cart.push({ product_id: product.id, size, color, qty });
      localStorage.setItem("stylematch:cart", JSON.stringify(cart));
    } catch {
      /* ignore */
    }
    toast.success("Added to cart", {
      description: `${product.name} · ${color}, ${size}, x${qty}`,
    });
  };

  const handleSave = async () => {
    if (!product) return;
    const wasSaved = saved;
    await toggle(product.id);
    wasSaved
      ? toast("Removed", { description: product.name })
      : toast.success("Saved", { description: product.name });
  };

  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setZoomPos({ x, y });
  };

  if (notFound) {
    return (
      <div className="sm-page-enter min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-6 py-32 md:px-10">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Not found
          </p>
          <h1 className="text-foreground">This piece is no longer available.</h1>
          <Link
            to="/"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-5 text-xs font-medium text-background transition-opacity hover:opacity-90"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to recommendations
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="sm-page-enter min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-8 md:px-10 md:pb-24">
          {/* Breadcrumb */}
          <button
            onClick={() => router.history.back()}
            className="mb-8 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back
          </button>

          {!product ? (
            <DetailSkeleton />
          ) : (
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
              {/* Image with zoom */}
              <div>
                <div
                  className="group relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-sm bg-secondary"
                  onMouseEnter={() => setZoom(true)}
                  onMouseLeave={() => setZoom(false)}
                  onMouseMove={handleZoomMove}
                  onClick={() => setZoom((z) => !z)}
                  role="button"
                  aria-label="Zoom product image"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 ease-out"
                      style={
                        zoom
                          ? {
                              transform: "scale(1.8)",
                              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                            }
                          : undefined
                      }
                    />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                  <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-confidence-soft px-2.5 py-1 text-[11px] font-medium text-confidence backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-confidence" />
                    {confidence}% match
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-col gap-7 lg:sticky lg:top-24 lg:self-start">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {product.category ?? "Apparel"}
                  </p>
                  <h1 className="mt-3 text-[28px] font-medium leading-tight text-foreground md:text-[34px]">
                    {product.name}
                  </h1>

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <p className="text-2xl font-medium tabular-nums text-foreground">
                      ${product.price.toFixed(0)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Stars value={product.rating ?? 4.6} />
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {(product.rating ?? 4.6).toFixed(1)} · {reviewCount}{" "}
                        reviews
                      </span>
                    </div>
                  </div>
                </div>

                {/* Why this pick */}
                <section className="rounded-sm border border-border bg-secondary/40 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-confidence" strokeWidth={1.75} />
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Why this pick
                    </p>
                  </div>
                  {reasonLoading ? (
                    <div className="flex flex-col gap-2">
                      <span className="sm-shimmer h-3 w-full rounded-sm" />
                      <span className="sm-shimmer h-3 w-5/6 rounded-sm" />
                      <span className="sm-shimmer h-3 w-2/3 rounded-sm" />
                    </div>
                  ) : reasonError ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {reasonError}
                    </p>
                  ) : (
                    <p className="animate-[sm-fade-in_0.4s_ease-out_both] text-sm leading-relaxed text-foreground">
                      {reason ||
                        "A versatile piece with broad styling potential — works across capsule wardrobes."}
                    </p>
                  )}
                </section>

                {/* Color */}
                <div>
                  <div className="mb-3 flex items-baseline justify-between">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Color
                    </p>
                    <span className="text-xs text-foreground">{color}</span>
                  </div>
                  <div className="flex gap-2.5">
                    {COLOR_VARIANTS.map((c) => {
                      const active = c.name === color;
                      return (
                        <button
                          key={c.name}
                          onClick={() => setColor(c.name)}
                          aria-label={c.name}
                          aria-pressed={active}
                          title={c.name}
                          className={`sm-focus h-10 w-10 rounded-full border transition-all ${
                            active
                              ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background"
                              : "border-border hover:scale-105"
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <div className="mb-3 flex items-baseline justify-between">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Size
                    </p>
                    <button className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
                      Size guide
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {SIZES.map((s) => {
                      const active = size === s;
                      return (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          aria-pressed={active}
                          className={`sm-focus h-11 rounded-sm border text-sm font-medium transition-all active:scale-[0.97] ${
                            active
                              ? "border-foreground bg-foreground text-background"
                              : "border-border text-foreground hover:border-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity + Add to cart */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex h-12 items-center rounded-sm border border-border">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="sm-focus flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                      aria-label="Decrease quantity"
                      disabled={qty <= 1}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium tabular-nums">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => Math.min(10, q + 1))}
                      className="sm-focus flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="sm-focus group inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-sm bg-foreground px-6 text-sm font-medium text-background transition-all hover:opacity-90 active:scale-[0.98]"
                  >
                    <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
                    Add to cart · ${(product.price * qty).toFixed(0)}
                  </button>

                  <button
                    onClick={handleSave}
                    aria-label={saved ? "Remove from saved" : "Save"}
                    aria-pressed={saved}
                    className={`sm-focus flex h-12 w-12 items-center justify-center rounded-sm border transition-all active:scale-90 ${
                      saved
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-foreground hover:border-foreground"
                    }`}
                  >
                    <Heart
                      className="h-4 w-4"
                      fill={saved ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                {/* Trust strip */}
                <ul className="mt-2 grid grid-cols-1 gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:grid-cols-3">
                  <li className="flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Free shipping over $150
                  </li>
                  <li className="flex items-center gap-2">
                    <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
                    30-day returns
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Authenticity guaranteed
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Similar carousel */}
        {product && similar.length > 0 && (
          <SimilarCarousel items={similar} />
        )}

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-10 text-xs text-muted-foreground md:px-10">
            <p>© {new Date().getFullYear()} StyleMatch</p>
            <p>Crafted with care.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.round(value);
        return (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${filled ? "text-foreground" : "text-border"}`}
            fill={filled ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        );
      })}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
      <div className="sm-shimmer aspect-[4/5] w-full rounded-sm" />
      <div className="flex flex-col gap-5">
        <div className="sm-shimmer h-3 w-24 rounded-sm" />
        <div className="sm-shimmer h-8 w-3/4 rounded-sm" />
        <div className="sm-shimmer h-6 w-32 rounded-sm" />
        <div className="sm-shimmer mt-4 h-24 w-full rounded-sm" />
        <div className="sm-shimmer mt-4 h-12 w-full rounded-sm" />
      </div>
    </div>
  );
}

function SimilarCarousel({ items }: { items: Product[] }) {
  const [scrollerEl, setScrollerEl] = useState<HTMLDivElement | null>(null);

  const scrollBy = (dir: 1 | -1) => {
    if (!scrollerEl) return;
    const amount = scrollerEl.clientWidth * 0.8 * dir;
    scrollerEl.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              You might also like
            </p>
            <h2 className="mt-3 text-foreground">Similar recommendations</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
              className="sm-focus flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-foreground active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
              className="sm-focus flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-foreground active:scale-95"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div
          ref={setScrollerEl}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((p) => (
            <Link
              key={p.id}
              to="/products/$productId"
              params={{ productId: p.id }}
              className="w-[72%] shrink-0 snap-start sm:w-[44%] lg:w-[28%] xl:w-[23%]"
            >
              <ProductCard product={p} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
