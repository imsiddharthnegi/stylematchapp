import { ArrowRight, Sparkles, ListChecks, ShoppingBag } from "lucide-react";
import heroImg from "@/assets/hero.jpg";

export function Hero({ onStartQuiz }: { onStartQuiz?: () => void }) {
  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
          <div className="order-2 lg:order-1">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              AI-Powered Recommendations
            </p>
            <h1 className="text-foreground">
              Find Your Style,<br />Instantly.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
              StyleMatch learns your taste in 60 seconds, then quietly curates
              pieces that feel like they were made for you. No noise. No
              guesswork. Just the right things.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button
                onClick={onStartQuiz}
                className="group inline-flex h-12 items-center gap-2 rounded-sm bg-foreground px-6 text-sm font-medium text-background transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Start Shopping
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
              </button>
              <a
                href="#how-it-works"
                className="inline-flex h-12 items-center px-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                How it works
              </a>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-secondary">
              <img
                src={heroImg}
                alt="A model in considered, neutral-toned tailoring — the StyleMatch aesthetic"
                width={1536}
                height={1280}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-sm bg-background/90 px-4 py-3 backdrop-blur md:bottom-6 md:left-6 md:right-6">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Editor's pick
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-foreground">
                    The Quiet Tailoring Edit
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-confidence-soft px-2.5 py-1 text-[11px] font-medium text-confidence">
                  <span className="h-1.5 w-1.5 rounded-full bg-confidence" />
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
      className="scroll-mt-20 border-b border-border bg-secondary/40"
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
                className="group relative flex flex-col gap-5 border-t border-border pt-8 transition-colors hover:border-foreground"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {s.label}
                  </span>
                  <Icon
                    className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground"
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
