import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Check, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type StylePreferences = {
  vibe: string | null;
  colors: string[];
  priceRange: [number, number];
  fit: string | null;
  occasions: string[];
};

const VIBES = [
  { id: "Minimal", desc: "Quiet lines. Considered neutrals." },
  { id: "Streetwear", desc: "Urban edge. Loud silhouettes." },
  { id: "Classic", desc: "Timeless tailoring. Heritage cuts." },
  { id: "Bohemian", desc: "Free-spirited. Layered textures." },
];

const PALETTES = [
  { name: "Neutrals", swatches: ["#F5F1EA", "#D8C9B0", "#A8845A"] },
  { name: "Earth tones", swatches: ["#5C6240", "#9C4A2A", "#5E2A2E"] },
  { name: "Bold colors", swatches: ["#D93636", "#1F6FEB", "#F2C12E"] },
  { name: "Pastels", swatches: ["#F4C2C2", "#C9E4DE", "#E2D5F8"] },
  { name: "Monochrome", swatches: ["#0E0E10", "#7A7A7C", "#EDEDED"] },
];

const FITS = ["Oversized", "Relaxed", "Fitted", "Tailored"];
const OCCASIONS = ["Everyday", "Work", "Going out", "Travel"];
const STORAGE_KEY = "stylematch:preferences";
const TOTAL = 5;
const MAX_COLORS = 3;
const MAX_OCCASIONS = 2;

const DEFAULT: StylePreferences = {
  vibe: null,
  colors: [],
  priceRange: [60, 320],
  fit: null,
  occasions: [],
};

export function StyleQuiz({
  open,
  onOpenChange,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onComplete?: (prefs: StylePreferences) => void;
}) {
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<StylePreferences>(DEFAULT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const progress = ((step + 1) / TOTAL) * 100;
  const canAdvance =
    (step === 0 && !!prefs.vibe) ||
    (step === 1 && prefs.colors.length > 0) ||
    (step === 2 && !!prefs.fit) ||
    step === 3 ||
    (step === 4 && prefs.occasions.length > 0);

  const next = () => step < TOTAL - 1 && setStep((s) => s + 1);
  const back = () => step > 0 && setStep((s) => s - 1);

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;
      if (user) {
        await supabase.from("user_profiles").upsert(
          [
            {
              user_id: user.id,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              style_preferences: prefs as any,
            },
          ],
          { onConflict: "user_id" },
        );
      }
    } catch (err) {
      console.warn("[StyleQuiz] save failed", err);
    } finally {
      setSaving(false);
      onComplete?.(prefs);
      onOpenChange(false);
    }
  };

  const togglePalette = (name: string) =>
    setPrefs((p) => {
      const has = p.colors.includes(name);
      if (has) return { ...p, colors: p.colors.filter((x) => x !== name) };
      if (p.colors.length >= MAX_COLORS) return p;
      return { ...p, colors: [...p.colors, name] };
    });

  const toggleOccasion = (name: string) =>
    setPrefs((p) => {
      const has = p.occasions.includes(name);
      if (has) return { ...p, occasions: p.occasions.filter((x) => x !== name) };
      if (p.occasions.length >= MAX_OCCASIONS) return p;
      return { ...p, occasions: [...p.occasions, name] };
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden border-border bg-background p-0 sm:rounded-sm">
        <div className="flex items-center justify-between gap-4 border-b border-border px-8 pb-5 pt-7">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-foreground" strokeWidth={1.5} />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Step {step + 1} of {TOTAL}
            </span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip
          </button>
        </div>

        <div className="h-[2px] w-full bg-secondary">
          <div
            className="h-full bg-foreground transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="relative overflow-hidden px-8 py-10">
          <div key={step} className="animate-in fade-in slide-in-from-right-4 duration-300">
            {step === 0 && (
              <StepWrap title="What's your style vibe?" subtitle="Pick the one that feels most like you.">
                <div className="grid grid-cols-2 gap-3">
                  {VIBES.map((v) => {
                    const active = prefs.vibe === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setPrefs((p) => ({ ...p, vibe: v.id }))}
                        className={`group relative flex flex-col items-start gap-1.5 rounded-sm border p-5 text-left transition-all ${
                          active
                            ? "border-foreground bg-foreground/[0.03]"
                            : "border-border hover:border-foreground/40"
                        }`}
                      >
                        <span className="text-[15px] font-medium text-foreground">{v.id}</span>
                        <span className="text-xs leading-relaxed text-muted-foreground">{v.desc}</span>
                        {active && (
                          <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </StepWrap>
            )}

            {step === 1 && (
              <StepWrap
                title="Color palette"
                subtitle={`Pick up to ${MAX_COLORS}. ${prefs.colors.length} selected.`}
              >
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {PALETTES.map((p) => {
                    const active = prefs.colors.includes(p.name);
                    const disabled = !active && prefs.colors.length >= MAX_COLORS;
                    return (
                      <button
                        key={p.name}
                        onClick={() => togglePalette(p.name)}
                        disabled={disabled}
                        className={`flex items-center justify-between rounded-sm border px-4 py-3 text-left transition-all ${
                          active
                            ? "border-foreground bg-foreground/[0.03]"
                            : "border-border hover:border-foreground/40"
                        } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex">
                            {p.swatches.map((s, i) => (
                              <span
                                key={i}
                                className="h-6 w-6 rounded-full border border-border"
                                style={{ backgroundColor: s, marginLeft: i === 0 ? 0 : -8 }}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-foreground">{p.name}</span>
                        </div>
                        {active && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </StepWrap>
            )}

            {step === 2 && (
              <StepWrap title="Fit preference?" subtitle="How should pieces sit on you?">
                <div className="grid grid-cols-2 gap-3">
                  {FITS.map((f) => {
                    const active = prefs.fit === f;
                    return (
                      <button
                        key={f}
                        onClick={() => setPrefs((p) => ({ ...p, fit: f }))}
                        className={`flex items-center justify-between rounded-sm border px-5 py-4 text-left transition-all ${
                          active
                            ? "border-foreground bg-foreground/[0.03]"
                            : "border-border hover:border-foreground/40"
                        }`}
                      >
                        <span className="text-[15px] font-medium text-foreground">{f}</span>
                        {active && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </StepWrap>
            )}

            {step === 3 && (
              <StepWrap title="Budget range" subtitle="Where should we focus your recommendations?">
                <div className="rounded-sm border border-border p-6">
                  <div className="mb-6 flex items-baseline justify-between">
                    <span className="text-2xl font-medium tabular-nums text-foreground">
                      ${prefs.priceRange[0]}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">to</span>
                    <span className="text-2xl font-medium tabular-nums text-foreground">
                      ${prefs.priceRange[1]}
                    </span>
                  </div>
                  <Slider
                    min={20}
                    max={500}
                    step={10}
                    value={prefs.priceRange}
                    onValueChange={(v) =>
                      setPrefs((p) => ({ ...p, priceRange: [v[0], v[1]] as [number, number] }))
                    }
                    className="mb-3"
                  />
                  <div className="flex justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
                    <span>$20</span>
                    <span>$500</span>
                  </div>
                </div>
              </StepWrap>
            )}

            {step === 4 && (
              <StepWrap
                title="Occasion"
                subtitle={`Pick up to ${MAX_OCCASIONS}. ${prefs.occasions.length} selected.`}
              >
                <div className="grid grid-cols-2 gap-3">
                  {OCCASIONS.map((o) => {
                    const active = prefs.occasions.includes(o);
                    const disabled = !active && prefs.occasions.length >= MAX_OCCASIONS;
                    return (
                      <button
                        key={o}
                        onClick={() => toggleOccasion(o)}
                        disabled={disabled}
                        className={`flex items-center justify-between rounded-sm border px-5 py-4 text-left transition-all ${
                          active
                            ? "border-foreground bg-foreground/[0.03]"
                            : "border-border hover:border-foreground/40"
                        } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
                      >
                        <span className="text-[15px] font-medium text-foreground">{o}</span>
                        {active && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </StepWrap>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border px-8 py-5">
          <button
            onClick={back}
            disabled={step === 0}
            className="inline-flex h-10 items-center gap-1.5 rounded-sm px-3 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-0"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {step < TOTAL - 1 ? (
            <button
              onClick={next}
              disabled={!canAdvance}
              className="inline-flex h-10 items-center gap-1.5 rounded-sm bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!canAdvance || saving}
              className="inline-flex h-10 items-center gap-1.5 rounded-sm bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {saving ? "Saving…" : "See my matches"}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepWrap({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-foreground">{title}</h2>
      <p className="mb-7 mt-2 text-sm text-muted-foreground">{subtitle}</p>
      {children}
    </div>
  );
}

export function getSavedPreferences(): StylePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StylePreferences>;
    return {
      vibe: parsed.vibe ?? null,
      colors: parsed.colors ?? [],
      priceRange: (parsed.priceRange as [number, number]) ?? [60, 320],
      fit: parsed.fit ?? null,
      occasions: parsed.occasions ?? [],
    };
  } catch {
    return null;
  }
}
