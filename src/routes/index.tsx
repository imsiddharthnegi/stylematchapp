import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProductCard, type Product } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import {
  StyleQuiz,
  getSavedPreferences,
  type StylePreferences,
} from "@/components/StyleQuiz";
import { generateRecommendationReasons } from "@/server/recommendations.functions";
import { Sparkles } from "lucide-react";

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
  const [products, setProducts] = useState<Product[] | null>(null);
  const [prefs, setPrefs] = useState<StylePreferences | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [reasonsLoading, setReasonsLoading] = useState(false);

  useEffect(() => {
    setPrefs(getSavedPreferences());
    supabase
      .from("products")
      .select("id,name,price,image_url,category,rating")
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

  const items = showEmpty ? [] : personalized;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />

        <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <h2 className="text-foreground">
                {prefs ? "Curated for you" : "Trending now"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {items === null
                  ? "Loading recommendations…"
                  : prefs
                    ? `${items.length} pieces matched to your ${prefs.vibe?.toLowerCase() ?? "style"} profile`
                    : `${items.length} pieces — take the quiz to personalize`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuizOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-foreground px-4 text-xs font-medium text-background transition-opacity hover:opacity-90"
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

          {items === null ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="aspect-[4/5] animate-pulse rounded-sm bg-secondary" />
                  <div className="h-3 w-1/3 animate-pulse rounded-sm bg-secondary" />
                  <div className="h-4 w-2/3 animate-pulse rounded-sm bg-secondary" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              onStart={() => {
                setShowEmpty(false);
                setQuizOpen(true);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
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
        }}
      />
    </div>
  );
}
