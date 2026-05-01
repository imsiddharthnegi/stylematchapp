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
};

const VIBES = [
  { id: "Minimalist", desc: "Quiet lines. Considered neutrals." },
  { id: "Bold", desc: "Statement pieces. Confident color." },
  { id: "Classic", desc: "Timeless tailoring. Heritage cuts." },
  { id: "Eclectic", desc: "Mixed eras. Personal patchwork." },
];

const COLORS = [
  { name: "Ivory", hex: "#F5F1EA" },
  { name: "Sand", hex: "#D8C9B0" },
  { name: "Camel", hex: "#A8845A" },
  { name: "Olive", hex: "#5C6240" },
  { name: "Forest", hex: "#2E3A2C" },
  { name: "Slate", hex: "#5A6470" },
  { name: "Charcoal", hex: "#2A2A2C" },
  { name: "Black", hex: "#0E0E10" },
  { name: "Burgundy", hex: "#5E2A2E" },
  { name: "Rust", hex: "#9C4A2A" },
  { name: "Navy", hex: "#1E2A44" },
  { name: "Cream", hex: "#EDE3D0" },
];

const FITS = ["Fitted", "Relaxed", "Oversized"];
const STORAGE_KEY = "stylematch:preferences";
const TOTAL = 4;

const DEFAULT: StylePreferences = {
  vibe: null,
  colors: [],
  priceRange: [60, 320],
  fit: null,
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
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    if (open) {
      setStep(0);
      setDirection(1);
    }
  }, [open]);

  const progress = ((step + 1) / TOTAL) * 100;
  const canAdvance =
    (step === 0 && !!prefs.vibe) ||
    (step === 1 && prefs.colors.length > 0) ||
    step === 2 ||
    (step === 3 && !!prefs.fit);

  const next = () => {
    if (step < TOTAL - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };
  const back = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

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

  const handleSkip = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden border-border bg-background p-0 sm:rounded-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-border px-8 pb-5 pt-7">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-foreground" strokeWidth={1.5} />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Style Quiz · {step + 1} of {TOTAL}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip
          </button>
        </div>

        {/* Progress */}
        <div className="h-[2px] w-full bg-secondary">
          <div
            className="h-full bg-foreground transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step content */}
        <div className="relative overflow-hidden px-8 py-10">
          <div
            key={step}
            className="animate-in fade-in slide-in-from-right-4 duration-300"
            style={{
              animationName: direction === 1 ? undefined : "fadeInLeft",
            }}
          >
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
                        <span className="text-[15px] font-medium text-foreground">
                          {v.id}
                        </span>
                        <span className="text-xs leading-relaxed text-muted-foreground">
                          {v.desc}
                        </span>
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
                title="Favorite colors?"
                subtitle={`Choose any that catch your eye. ${prefs.colors.length} selected.`}
              >
                <div className="grid grid-cols-6 gap-3">
                  {COLORS.map((c) => {
                    const active = prefs.colors.includes(c.name);
                    return (
                      <button
                        key={c.name}
                        onClick={() =>
                          setPrefs((p) => ({
                            ...p,
                            colors: active
                              ? p.colors.filter((x) => x !== c.name)
                              : [...p.colors, c.name],
                          }))
                        }
                        title={c.name}
                        className="group flex flex-col items-center gap-2"
                      >
                        <span
                          className={`relative flex h-14 w-14 items-center justify-center rounded-full border transition-all ${
                            active
                              ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background"
                              : "border-border hover:scale-105"
                          }`}
                          style={{ backgroundColor: c.hex }}
                        >
                          {active && (
                            <Check
                              className="h-4 w-4"
                              strokeWidth={3}
                              style={{
                                color:
                                  c.name === "Ivory" || c.name === "Sand" || c.name === "Cream"
                                    ? "#000"
                                    : "#fff",
                              }}
                            />
                          )}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </StepWrap>
            )}

            {step === 2 && (
              <StepWrap title="Price range?" subtitle="Where should we focus your recommendations?">
                <div className="rounded-sm border border-border p-6">
                  <div className="mb-6 flex items-baseline justify-between">
                    <span className="text-2xl font-medium tabular-nums text-foreground">
                      ${prefs.priceRange[0]}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      to
                    </span>
                    <span className="text-2xl font-medium tabular-nums text-foreground">
                      ${prefs.priceRange[1]}
                    </span>
                  </div>
                  <Slider
                    min={10}
                    max={500}
                    step={10}
                    value={prefs.priceRange}
                    onValueChange={(v) =>
                      setPrefs((p) => ({
                        ...p,
                        priceRange: [v[0], v[1]] as [number, number],
                      }))
                    }
                    className="mb-3"
                  />
                  <div className="flex justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
                    <span>$10</span>
                    <span>$500</span>
                  </div>
                </div>
              </StepWrap>
            )}

            {step === 3 && (
              <StepWrap title="Fit preference?" subtitle="How should pieces sit on you?">
                <div className="flex flex-col gap-3">
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
          </div>
        </div>

        {/* Footer */}
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
              {saving ? "Saving…" : "Save Profile"}
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
    return raw ? (JSON.parse(raw) as StylePreferences) : null;
  } catch {
    return null;
  }
}
