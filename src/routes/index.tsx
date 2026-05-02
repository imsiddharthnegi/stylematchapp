import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProductCard, type Product } from "@/components/ProductCard";
import { AIStylistButton } from "@/components/AIStylistButton";
import { EmptyState } from "@/components/EmptyState";
import {
  StyleQuiz,
  getSavedPreferences,
  type StylePreferences,
} from "@/components/StyleQuiz";
import {
  FilterSidebar,
  CATEGORY_GROUPS,
  DEFAULT_FILTERS,
  type FilterState,
} from "@/components/FilterSidebar";
import { generateRecommendationReasons } from "@/server/recommendations.functions";
import { Sparkles, SlidersHorizontal, X } from "lucide-react";

const searchSchema = z.object({
  cats: fallback(z.array(z.string()), []).default([]),
  pmin: fallback(z.number().min(10).max(500), 10).default(10),
  pmax: fallback(z.number().min(10).max(500), 500).default(500),
  colors: fallback(z.array(z.string()), []).default([]),
  rating: fallback(z.union([z.literal(0), z.literal(3), z.literal(4)]), 0).default(0),
  sort: fallback(
    z.enum(["recommended", "price_asc", "trending", "new"]),
    "recommended",
  ).default("recommended"),
});

const REASON_CACHE_KEY = "stylematch:reasons";
const REASON_TTL_MS = 60 * 60 * 1000; // 1 hour

type ReasonCache = {
  prefsHash: string;
  ts: number;
  reasons: Record<string, string>;
};

function hashPrefs(p: StylePreferences): string {
  return JSON.stringify({
    v: p.vibe,
    c: [...(p.colors ?? [])].sort(),
    p: p.priceRange,
    f: p.fit,
  });
}

function readReasonCache(): ReasonCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(REASON_CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as ReasonCache;
    if (Date.now() - c.ts > REASON_TTL_MS) return null;
    return c;
  } catch {
    return null;
  }
}

function writeReasonCache(c: ReasonCache) {
  try {
    localStorage.setItem(REASON_CACHE_KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
}

export const Route = createFileRoute("/")({
  component: Dashboard,
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "StyleMatch — Discover Your Perfect Style" },
      {
        name: "description",
        content:
          "AI-powered fashion recommendations curated to your taste. Quiet, considered, personal.",
      },
    ],
  }),
});

function scoreProduct(p: Product, prefs: StylePreferences): number {
  let score = 70;
  const [min, max] = prefs.priceRange;
  if (p.price >= min && p.price <= max) score += 18;
  else {
    const dist = p.price < min ? min - p.price : p.price - max;
    score -= Math.min(35, dist / 8);
  }
  if (prefs.vibe && p.category?.toLowerCase().includes(prefs.vibe.toLowerCase()))
    score += 6;
  if (p.rating) score += Math.min(8, p.rating * 1.5);
  // tiny variance for visual diversity, deterministic per id
  const seed = p.id.charCodeAt(0) + p.id.charCodeAt(p.id.length - 1);
  score += (seed % 7) - 3;
  return Math.max(40, Math.min(99, Math.round(score)));
}

function Dashboard() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const filters: FilterState = useMemo(
    () => ({
      categories: search.cats,
      price: [search.pmin, search.pmax],
      colors: search.colors,
      rating: search.rating,
      sort: search.sort,
    }),
    [search],
  );

  const setFilters = (next: FilterState) => {
    navigate({
      search: {
        cats: next.categories,
        pmin: next.price[0],
        pmax: next.price[1],
        colors: next.colors,
        rating: next.rating,
        sort: next.sort,
      },
      replace: true,
    });
  };

  const [products, setProducts] = useState<Product[] | null>(null);
  const [prefs, setPrefs] = useState<StylePreferences | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [reasonsLoading, setReasonsLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setPrefs(getSavedPreferences());
    supabase
      .from("products")
      .select("id,name,price,image_url,category,rating,tags,created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setProducts((data as Product[]) ?? []));
  }, []);

  const personalized = useMemo<Product[] | null>(() => {
    if (!products) return null;
    if (!prefs) return products;
    return [...products]
      .map((p) => ({ ...p, confidence: scoreProduct(p, prefs) }))
      .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
  }, [products, prefs]);

  const filtered = useMemo<Product[] | null>(() => {
    if (!personalized) return null;
    const catMatchers = filters.categories
      .map((id) => CATEGORY_GROUPS.find((g) => g.id === id))
      .filter(Boolean)
      .flatMap((g) => g!.matches.map((m) => m.toLowerCase()));

    const colorSet = new Set(filters.colors.map((c) => c.toLowerCase()));

    let list = personalized.filter((p) => {
      if (p.price < filters.price[0] || p.price > filters.price[1]) return false;
      if (filters.rating > 0 && (p.rating ?? 0) < filters.rating) return false;
      if (catMatchers.length > 0) {
        const cat = (p.category ?? "").toLowerCase();
        if (!catMatchers.some((m) => cat.includes(m))) return false;
      }
      if (colorSet.size > 0) {
        const hay = [
          ...(p.tags ?? []).map((t) => t.toLowerCase()),
          (p.name ?? "").toLowerCase(),
        ].join(" ");
        if (![...colorSet].some((c) => hay.includes(c))) return false;
      }
      return true;
    });

    list = [...list];
    switch (filters.sort) {
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "trending":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "new":
        list.sort((a, b) =>
          (b.created_at ?? "").localeCompare(a.created_at ?? ""),
        );
        break;
      case "recommended":
      default:
        list.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
    }
    return list;
  }, [personalized, filters]);

  // Fetch AI reasons for top 6 personalized products, with 1h cache.
  useEffect(() => {
    if (!prefs || !personalized || personalized.length === 0) return;
    const top = personalized.slice(0, 6);
    const prefsHash = hashPrefs(prefs);
    const cached = readReasonCache();
    if (cached && cached.prefsHash === prefsHash) {
      const haveAll = top.every((p) => p.id in cached.reasons);
      if (haveAll) {
        setReasons(cached.reasons);
        return;
      }
    }

    let cancelled = false;
    setReasonsLoading(true);
    generateRecommendationReasons({
      data: {
        preferences: {
          vibe: prefs.vibe,
          colors: prefs.colors,
          priceRange: prefs.priceRange,
          fit: prefs.fit,
        },
        products: top.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
        })),
      },
    })
      .then((res) => {
        if (cancelled) return;
        const map: Record<string, string> = {};
        for (const r of res.reasons) if (r.reason) map[r.id] = r.reason;
        setReasons(map);
        writeReasonCache({ prefsHash, ts: Date.now(), reasons: map });
      })
      .catch((err) => console.warn("[reasons]", err))
      .finally(() => {
        if (!cancelled) setReasonsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [prefs, personalized]);

  const items = showEmpty ? [] : filtered;
  const totalCount = filtered?.length ?? 0;

  return (
    <div className="sm-page-enter sm-grain min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero onStartQuiz={() => setQuizOpen(true)} />

        <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <h2 className="text-foreground">
                {prefs ? "Curated for you" : "Trending now"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {items === null
                  ? "Curating your feed…"
                  : prefs
                    ? `${totalCount} pieces matched to your ${prefs.vibe?.toLowerCase() ?? "style"} profile`
                    : `${totalCount} pieces — take the quiz to personalize`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFiltersOpen((v) => !v)}
                className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border px-4 text-xs font-medium text-foreground transition-colors hover:border-foreground lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
                Filters
              </button>
              <button
                onClick={() => setQuizOpen(true)}
                className="btn-neon inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold"
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
                {prefs ? "Retake quiz" : "Style quiz"}
              </button>
              <button
                onClick={() => setShowEmpty((v) => !v)}
                className="hidden h-9 rounded-sm border border-border px-4 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground md:inline-flex md:items-center"
              >
                {showEmpty ? "Show recommendations" : "Preview empty state"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr] lg:gap-12">
            {/* Desktop sidebar */}
            <div className="hidden lg:block">
              <FilterSidebar
                value={filters}
                onChange={setFilters}
                resultCount={totalCount}
              />
            </div>

            {/* Mobile sheet */}
            {mobileFiltersOpen && (
              <div className="fixed inset-0 z-50 flex lg:hidden">
                <div
                  className="absolute inset-0 bg-foreground/40"
                  onClick={() => setMobileFiltersOpen(false)}
                />
                <div className="relative ml-auto flex h-full w-[88%] max-w-sm flex-col gap-6 overflow-y-auto bg-background p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-foreground">Filters</h3>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <FilterSidebar
                    value={filters}
                    onChange={setFilters}
                    resultCount={totalCount}
                  />
                </div>
              </div>
            )}

            <div>
              {items === null ? (
                <div className="columns-1 gap-6 sm:columns-2 xl:columns-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="mb-6 flex break-inside-avoid flex-col gap-4">
                      <div
                        className="sm-shimmer rounded-2xl"
                        style={{ aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "4/5" : "5/6" }}
                      />
                      <div className="sm-shimmer h-3 w-1/3 rounded-sm" />
                      <div className="sm-shimmer h-4 w-2/3 rounded-sm" />
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                showEmpty || personalized?.length === 0 ? (
                  <EmptyState
                    onStart={() => {
                      setShowEmpty(false);
                      setQuizOpen(true);
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
                    <p className="text-sm text-foreground">No pieces match your filters.</p>
                    <button
                      onClick={() => setFilters(DEFAULT_FILTERS)}
                      className="text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Reset filters
                    </button>
                  </div>
                )
              ) : (
                <div className="columns-1 gap-6 sm:columns-2 xl:columns-3">
                  {items.map((p, i) => (
                    <Link
                      key={p.id}
                      to="/products/$productId"
                      params={{ productId: p.id }}
                      className="sm-card-in block break-inside-avoid"
                      style={{ animationDelay: `${Math.min(i, 12) * 100}ms` }}
                    >
                      <ProductCard
                        product={p}
                        reason={reasons[p.id]}
                        reasonLoading={
                          !!prefs && i < 6 && reasonsLoading && !reasons[p.id]
                        }
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-10 text-xs text-muted-foreground md:px-10">
            <p>© {new Date().getFullYear()} StyleMatch</p>
            <p>Crafted with care.</p>
          </div>
        </footer>
      </main>

      <StyleQuiz
        open={quizOpen}
        onOpenChange={setQuizOpen}
        onComplete={(p) => {
          setPrefs(p);
          setShowEmpty(false);
          setReasons({});
          try {
            localStorage.removeItem(REASON_CACHE_KEY);
          } catch {
            /* ignore */
          }
        }}
      />
      <AIStylistButton />
    </div>
  );
}
