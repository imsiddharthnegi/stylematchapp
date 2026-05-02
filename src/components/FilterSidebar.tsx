import { Slider } from "@/components/ui/slider";
import { Check, X } from "lucide-react";

export type FilterState = {
  categories: string[];
  price: [number, number];
  colors: string[];
  rating: 0 | 3 | 4;
  sort: "recommended" | "price_asc" | "trending" | "new";
};

export const CATEGORY_GROUPS: { id: string; label: string; matches: string[] }[] = [
  { id: "Tops", label: "Tops", matches: ["Shirts", "Knitwear", "Outerwear", "Dresses"] },
  { id: "Bottoms", label: "Bottoms", matches: ["Bottoms"] },
  { id: "Accessories", label: "Accessories", matches: ["Accessories"] },
  { id: "Shoes", label: "Shoes", matches: ["Footwear", "Shoes"] },
];

export const COLOR_SWATCHES = [
  { name: "Ivory", hex: "#F5F1EA" },
  { name: "Sand", hex: "#D8C9B0" },
  { name: "Camel", hex: "#A8845A" },
  { name: "Olive", hex: "#5C6240" },
  { name: "Slate", hex: "#5A6470" },
  { name: "Charcoal", hex: "#2A2A2C" },
  { name: "Black", hex: "#0E0E10" },
  { name: "Burgundy", hex: "#5E2A2E" },
  { name: "Navy", hex: "#1E2A44" },
];

const SORT_OPTIONS: { value: FilterState["sort"]; label: string }[] = [
  { value: "recommended", label: "Most Recommended" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "trending", label: "Trending" },
  { value: "new", label: "New" },
];

export const DEFAULT_FILTERS: FilterState = {
  categories: [],
  price: [10, 500],
  colors: [],
  rating: 0,
  sort: "recommended",
};

export function FilterSidebar({
  value,
  onChange,
  resultCount,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
  resultCount: number;
}) {
  const update = <K extends keyof FilterState>(key: K, v: FilterState[K]) =>
    onChange({ ...value, [key]: v });

  const toggleCategory = (id: string) =>
    update(
      "categories",
      value.categories.includes(id)
        ? value.categories.filter((c) => c !== id)
        : [...value.categories, id],
    );

  const toggleColor = (name: string) =>
    update(
      "colors",
      value.colors.includes(name)
        ? value.colors.filter((c) => c !== name)
        : [...value.colors, name],
    );

  const hasActive =
    value.categories.length > 0 ||
    value.colors.length > 0 ||
    value.rating !== 0 ||
    value.price[0] !== 10 ||
    value.price[1] !== 500 ||
    value.sort !== "recommended";

  return (
    <aside className="glass flex w-full flex-col gap-7 rounded-2xl p-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-gradient">
            Refine
          </h3>
          <p className="mt-1.5 text-sm text-foreground tabular-nums">
            {resultCount} {resultCount === 1 ? "piece" : "pieces"}
          </p>
        </div>
        {hasActive && (
          <button
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-white/30 hover:text-foreground"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <Section title="Sort by">
        <select
          value={value.sort}
          onChange={(e) => update("sort", e.target.value as FilterState["sort"])}
          className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-foreground transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-background">
              {o.label}
            </option>
          ))}
        </select>
      </Section>

      <Section title="Category">
        <ul className="flex flex-col gap-2.5">
          {CATEGORY_GROUPS.map((c) => {
            const active = value.categories.includes(c.id);
            return (
              <li key={c.id}>
                <button
                  onClick={() => toggleCategory(c.id)}
                  className="group flex w-full items-center gap-3 text-left"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-all ${
                      active
                        ? "border-transparent bg-gradient-primary text-white shadow-glow"
                        : "border-white/20 group-hover:border-white/50"
                    }`}
                  >
                    {active && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <span className="text-sm text-foreground">{c.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Price">
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-sm font-medium tabular-nums text-foreground">
            ${value.price[0]}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            to
          </span>
          <span className="text-sm font-medium tabular-nums text-foreground">
            ${value.price[1]}
          </span>
        </div>
        <Slider
          min={10}
          max={500}
          step={10}
          value={value.price}
          onValueChange={(v) => update("price", [v[0], v[1]] as [number, number])}
        />
      </Section>

      <Section title="Color">
        <div className="grid grid-cols-5 gap-2.5">
          {COLOR_SWATCHES.map((c) => {
            const active = value.colors.includes(c.name);
            const isLight = ["Ivory", "Sand"].includes(c.name);
            return (
              <button
                key={c.name}
                onClick={() => toggleColor(c.name)}
                title={c.name}
                aria-label={c.name}
                className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
                  active
                    ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background"
                    : "border-border hover:scale-105"
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {active && (
                  <Check
                    className="h-3.5 w-3.5"
                    strokeWidth={3}
                    style={{ color: isLight ? "#000" : "#fff" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Rating">
        <ul className="flex flex-col gap-2">
          {(
            [
              { v: 4, label: "4 stars & up" },
              { v: 3, label: "3 stars & up" },
              { v: 0, label: "All ratings" },
            ] as const
          ).map((r) => {
            const active = value.rating === r.v;
            return (
              <li key={r.v}>
                <button
                  onClick={() => update("rating", r.v)}
                  className="group flex w-full items-center gap-3 text-left"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      active
                        ? "border-foreground"
                        : "border-border group-hover:border-foreground/60"
                    }`}
                  >
                    {active && (
                      <span className="h-2 w-2 rounded-full bg-foreground" />
                    )}
                  </span>
                  <span className="text-sm text-foreground">{r.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Section>
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border pt-6 first-of-type:border-t-0 first-of-type:pt-0">
      <h4 className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}
