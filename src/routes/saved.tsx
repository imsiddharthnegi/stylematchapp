import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import {
  Heart,
  Star,
  Share2,
  ShoppingBag,
  X,
  Check,
  GitCompare,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { useSavedItems } from "@/hooks/useSavedItems";
import { type Product } from "@/components/ProductCard";

const searchSchema = z.object({
  ids: fallback(z.array(z.string()), []).default([]),
});

export const Route = createFileRoute("/saved")({
  component: SavedPage,
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Your Saved Items — StyleMatch" },
      {
        name: "description",
        content:
          "All the pieces you've saved, ready to compare, share, or move to cart.",
      },
    ],
  }),
});

function SavedPage() {
  const search = Route.useSearch();
  const { ids: localIds, store, toggle, setNote, hydrated } = useSavedItems();

  // Combine locally saved IDs with any IDs in the URL (for shared lists).
  const ids = useMemo(() => {
    const set = new Set<string>(localIds);
    for (const id of search.ids) set.add(id);
    return [...set];
  }, [localIds, search.ids]);

  const [products, setProducts] = useState<Product[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cartToast, setCartToast] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    void supabase
      .from("products")
      .select("id,name,price,image_url,category,rating,tags,created_at")
      .in("id", ids)
      .then(({ data }) => {
        const map = new Map((data ?? []).map((p) => [p.id, p as Product]));
        // Preserve the order: locally-saved first (most recent), then URL-only.
        const sortedLocal = [...localIds].sort((a, b) => {
          const at = store[a]?.saved_at ?? "";
          const bt = store[b]?.saved_at ?? "";
          return bt.localeCompare(at);
        });
        const ordered: Product[] = [];
        for (const id of [...sortedLocal, ...search.ids]) {
          const p = map.get(id);
          if (p && !ordered.find((x) => x.id === id)) ordered.push(p);
        }
        setProducts(ordered);
      });
  }, [hydrated, ids.join(","), localIds, search.ids, store]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.search = "";
    for (const id of localIds) url.searchParams.append("ids", id);
    const link = url.toString();
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", link);
    }
  };

  const handleBulkCart = () => {
    const target = selected.size > 0 ? [...selected] : localIds;
    if (target.length === 0) return;
    // Lightweight cart: persist to localStorage. Cart UI is out of scope.
    try {
      const raw = localStorage.getItem("stylematch:cart");
      const cart = raw ? (JSON.parse(raw) as string[]) : [];
      const next = Array.from(new Set([...cart, ...target]));
      localStorage.setItem("stylematch:cart", JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setCartToast(`Added ${target.length} item${target.length === 1 ? "" : "s"} to cart`);
    setTimeout(() => setCartToast(null), 2400);
  };

  const compareProducts = useMemo(
    () => (products ?? []).filter((p) => selected.has(p.id)),
    [products, selected],
  );

  const showEmpty = hydrated && (products?.length ?? 0) === 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Saved
              </p>
              <h1 className="mt-2 text-foreground">Your collection</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {products === null
                  ? "Loading…"
                  : `${products.length} ${products.length === 1 ? "piece" : "pieces"} saved · select up to 3 to compare`}
              </p>
            </div>

            {!showEmpty && products && products.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setCompareOpen(true)}
                  disabled={selected.size < 2}
                  className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border px-4 text-xs font-medium text-foreground transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <GitCompare className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Compare {selected.size > 0 ? `(${selected.size})` : ""}
                </button>
                <button
                  onClick={handleShare}
                  className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border px-4 text-xs font-medium text-foreground transition-colors hover:border-foreground"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2} />
                  ) : (
                    <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  )}
                  {copied ? "Link copied" : "Share"}
                </button>
                <button
                  onClick={handleBulkCart}
                  className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-foreground px-4 text-xs font-medium text-background transition-opacity hover:opacity-90"
                >
                  <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Add {selected.size > 0 ? selected.size : "all"} to cart
                </button>
              </div>
            )}
          </div>

          {products === null ? (
            <Skeleton />
          ) : showEmpty ? (
            <EmptySaved />
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <SavedCard
                  key={p.id}
                  product={p}
                  note={store[p.id]?.note}
                  selected={selected.has(p.id)}
                  selectionFull={selected.size >= 3}
                  onToggleSelect={() => toggleSelect(p.id)}
                  onRemove={() => void toggle(p.id)}
                  onNoteChange={(n) => setNote(p.id, n)}
                />
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

      {compareOpen && compareProducts.length >= 2 && (
        <CompareModal
          products={compareProducts}
          notes={store}
          onClose={() => setCompareOpen(false)}
        />
      )}

      {cartToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-5 py-2.5 text-xs font-medium text-background shadow-lg">
          {cartToast}
        </div>
      )}
    </div>
  );
}

function SavedCard({
  product,
  note,
  selected,
  selectionFull,
  onToggleSelect,
  onRemove,
  onNoteChange,
}: {
  product: Product;
  note?: string;
  selected: boolean;
  selectionFull: boolean;
  onToggleSelect: () => void;
  onRemove: () => void;
  onNoteChange: (n: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note ?? "");

  const confidence =
    product.confidence ??
    Math.round(
      80 + ((product.id.charCodeAt(0) + product.id.charCodeAt(1)) % 18),
    );

  return (
    <article
      className={`group flex flex-col rounded-sm transition-all ${
        selected ? "ring-2 ring-foreground ring-offset-4 ring-offset-background" : ""
      }`}
    >
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
          onClick={onToggleSelect}
          disabled={!selected && selectionFull}
          aria-pressed={selected}
          aria-label={selected ? "Deselect for compare" : "Select for compare"}
          className={`absolute left-3 top-3 flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium backdrop-blur transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
            selected
              ? "bg-foreground text-background"
              : "bg-background/85 text-foreground hover:bg-background"
          }`}
        >
          <span
            className={`flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border ${
              selected ? "border-background bg-background text-foreground" : "border-foreground/40"
            }`}
          >
            {selected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
          </span>
          Compare
        </button>

        <button
          onClick={onRemove}
          aria-label="Remove from saved"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background backdrop-blur transition-opacity hover:opacity-90"
        >
          <Heart className="h-4 w-4" fill="currentColor" />
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

      <div className="mt-3">
        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 140))}
              autoFocus
              rows={2}
              placeholder="Why did you save this?"
              className="w-full resize-none rounded-sm border border-border bg-background p-2 text-xs text-foreground focus:border-foreground focus:outline-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {draft.length}/140
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setDraft(note ?? "");
                    setEditing(false);
                  }}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onNoteChange(draft.trim());
                    setEditing(false);
                  }}
                  className="rounded-sm bg-foreground px-2.5 py-1 text-[11px] font-medium text-background"
                >
                  Save note
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setDraft(note ?? "");
              setEditing(true);
            }}
            className="text-left text-[11px] leading-relaxed text-muted-foreground transition-colors hover:text-foreground"
          >
            {note ? `“${note}”` : "+ add a note"}
          </button>
        )}
      </div>
    </article>
  );
}

function CompareModal({
  products,
  notes,
  onClose,
}: {
  products: Product[];
  notes: Record<string, { note?: string }>;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-50 flex animate-in fade-in"
    >
      <div className="absolute inset-0 bg-foreground/50" onClick={onClose} />
      <div className="relative m-auto flex max-h-[92vh] w-[92%] max-w-5xl flex-col overflow-hidden rounded-sm border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-8 py-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Compare
            </p>
            <h2 className="mt-1 text-[20px] font-medium text-foreground">
              Side by side
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-px overflow-y-auto bg-border md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const note = notes[p.id]?.note;
            const confidence =
              p.confidence ??
              Math.round(80 + ((p.id.charCodeAt(0) + p.id.charCodeAt(1)) % 18));
            return (
              <div key={p.id} className="flex flex-col gap-4 bg-background p-6">
                <div className="aspect-[4/5] overflow-hidden rounded-sm bg-secondary">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {p.category ?? "Apparel"}
                  </p>
                  <h3 className="mt-1 text-[15px] font-medium text-foreground">
                    {p.name}
                  </h3>
                </div>
                <CompareRow label="Price">
                  <span className="text-[15px] font-medium tabular-nums text-foreground">
                    ${p.price.toFixed(0)}
                  </span>
                </CompareRow>
                <CompareRow label="Rating">
                  <span className="inline-flex items-center gap-1 text-sm text-foreground">
                    <Star className="h-3.5 w-3.5 fill-foreground" strokeWidth={0} />
                    {(p.rating ?? 0).toFixed(1)}
                  </span>
                </CompareRow>
                <CompareRow label="Match">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-confidence-soft px-2 py-0.5 text-[11px] font-medium text-confidence">
                    <span className="h-1.5 w-1.5 rounded-full bg-confidence" />
                    {confidence}%
                  </span>
                </CompareRow>
                <CompareRow label="Your note">
                  <p className="text-xs leading-relaxed text-foreground">
                    {note ? `“${note}”` : (
                      <span className="text-muted-foreground">No note yet</span>
                    )}
                  </p>
                </CompareRow>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CompareRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-t border-border pt-3">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4">
          <div className="aspect-[4/5] animate-pulse rounded-sm bg-secondary" />
          <div className="h-3 w-1/3 animate-pulse rounded-sm bg-secondary" />
          <div className="h-4 w-2/3 animate-pulse rounded-sm bg-secondary" />
        </div>
      ))}
    </div>
  );
}

function EmptySaved() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-sm border border-dashed border-border py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Heart className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-[18px] font-medium text-foreground">Nothing saved yet</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Tap the heart on any piece you love. We'll keep them here so you can
          compare and share later.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex h-10 items-center gap-1.5 rounded-sm bg-foreground px-5 text-xs font-medium text-background transition-opacity hover:opacity-90"
      >
        Browse pieces
      </Link>
    </div>
  );
}

void Trash2;
void Copy;
