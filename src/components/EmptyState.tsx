import { Sparkles } from "lucide-react";

export function EmptyState({ onStart }: { onStart?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-border bg-secondary/30 px-6 py-24 text-center">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-background border border-border">
        <Sparkles className="h-5 w-5 text-foreground" strokeWidth={1.5} />
      </div>
      <h2 className="text-foreground">No recommendations yet</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Take a 2-minute quiz so StyleMatch understands your taste — silhouettes,
        palette, and the brands you reach for.
      </p>
      <button
        onClick={onStart}
        className="mt-8 inline-flex h-11 items-center justify-center rounded-sm bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
      >
        Start Your Style Quiz
      </button>
    </div>
  );
}
