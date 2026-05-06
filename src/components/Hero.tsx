import { ArrowRight, Sparkles, ListChecks, ShoppingBag, Star } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { useCountUp } from "@/hooks/useCountUp";

function AnimatedNumber({
  value,
  suffix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  const v = useCountUp(value, 2000, true);
  return (
    <>
      {decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()}
      {suffix}
    </>
  );
}

export function Hero({ onStartQuiz }: { onStartQuiz?: () => void }) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10">
          <div
            className="sm-parallax absolute inset-0"
            style={{ backgroundImage: `url(${heroImg})` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
          <div
            className="absolute inset-0 opacity-40 mix-blend-screen"
            style={{ background: "radial-gradient(60% 50% at 30% 40%, rgba(59,130,246,0.25), transparent), radial-gradient(50% 50% at 80% 70%, rgba(168,85,247,0.22), transparent)" }}
          />
        </div>

        <div className="mx-auto grid min-h-[78vh] max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 md:px-10 md:py-32 lg:grid-cols-[1.15fr_1fr]">
          <div className="relative z-10">
            <p
              className="sm-headline-rise mb-7 inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
              style={{ animationDelay: "0ms" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-primary" />
              AI Stylist · Curated Daily
            </p>
            <h1
              className="sm-headline-rise text-foreground"
              style={{
                fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.04em",
                fontWeight: 600,
                animationDelay: "120ms",
              }}
            >
              Discover Your<br />
              <span className="text-gradient italic font-semibold">Signature Style</span>
            </h1>
            <p
              className="sm-headline-rise mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground"
              style={{ animationDelay: "240ms" }}
            >
              AI learns your taste in 60 seconds and curates perfect pieces — no
              noise, just matches you'll actually wear.
            </p>
            <div
              className="sm-headline-rise mt-10 flex flex-wrap items-center gap-4"
              style={{ animationDelay: "360ms" }}
            >
              <div className="group/tip relative">
                <button
                  onClick={onStartQuiz}
                  className="btn-neon sm-glow group inline-flex h-14 items-center gap-2.5 rounded-2xl px-7 text-[15px] font-semibold"
                >
                  <Sparkles className="h-4 w-4" strokeWidth={2} />
                  Start Style Quiz
                  <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium">60 sec</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                </button>
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max max-w-xs -translate-x-1/2 rounded-md border border-border bg-card px-3 py-2 text-[11px] leading-relaxed text-muted-foreground opacity-0 shadow-luxe transition-opacity duration-200 group-hover/tip:opacity-100"
                >
                  <span className="font-medium text-foreground">How your data is used</span>
                  <br />
                  Your answers stay local. No account needed.
                </span>
              </div>
              <a
                href="#how-it-works"
                className="inline-flex h-14 items-center px-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                How it works →
              </a>
            </div>

            <div
              className="sm-headline-rise mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-border/60 pt-7"
              style={{ animationDelay: "480ms" }}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2">
                  {[
                    "linear-gradient(135deg,#A8845A,#5C6240)",
                    "linear-gradient(135deg,#5E2A2E,#2A2A2C)",
                    "linear-gradient(135deg,#D8C9B0,#A8CABA)",
                  ].map((bg, i) => (
                    <span
                      key={i}
                      className="h-7 w-7 rounded-full border-2 border-background"
                      style={{ background: bg }}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground tabular-nums">2,400+</span>{" "}
                  style lovers
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                ))}
                <span className="ml-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground tabular-nums">4.8</span>{" "}
                  · 127 reviews
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground tabular-nums">94%</span>{" "}
                match accuracy
              </p>
            </div>
          </div>

          <div className="relative z-10 hidden lg:block">
            <div className="ml-auto w-fit rounded-2xl border border-border/60 bg-card/70 p-5 shadow-luxe backdrop-blur-md">
              <div className="flex items-center justify-between gap-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Today's pick
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-foreground">
                    The Quiet Tailoring Edit
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-medium text-gold">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  98% match
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
    </>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: ListChecks,
      label: "01 — Quiz",
      title: "Tell us your taste",
      body: "A 60-second style quiz captures your vibe, palette, fit, and budget. No accounts required.",
    },
    {
      icon: Sparkles,
      label: "02 — Recommendations",
      title: "We curate, you decide",
      body: "AI ranks every piece against your profile and explains why each one made the cut.",
    },
    {
      icon: ShoppingBag,
      label: "03 — Checkout",
      title: "Save, compare, buy",
      body: "Save favorites, compare side-by-side, and check out when you're ready. Nothing pushy.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-b border-border bg-card/30"
    >
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            How it works
          </p>
          <h2 className="mt-4 text-foreground">Three steps. No noise.</h2>
        </div>

        <ol className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <li
                key={s.label}
                className="group relative flex flex-col gap-5 rounded-2xl border border-border bg-background/40 p-7 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
                    {s.label}
                  </span>
                  <Icon
                    className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-xl font-medium leading-tight text-foreground">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
