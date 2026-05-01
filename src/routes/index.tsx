import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProductCard, type Product } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";

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

function Dashboard() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [showEmpty, setShowEmpty] = useState(false);

  useEffect(() => {
    supabase
      .from("products")
      .select("id,name,price,image_url,category,rating")
      .order("created_at", { ascending: false })
      .then(({ data }) => setProducts((data as Product[]) ?? []));
  }, []);

  const items = showEmpty ? [] : products;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />

        <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <h2 className="text-foreground">Curated for you</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {items === null
                  ? "Loading recommendations…"
                  : `${items.length} pieces matched to your profile`}
              </p>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <button
                onClick={() => setShowEmpty((v) => !v)}
                className="h-9 rounded-sm border border-border px-4 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
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
            <EmptyState onStart={() => setShowEmpty(false)} />
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
    </div>
  );
}
