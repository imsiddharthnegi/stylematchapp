import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { toast } from "sonner";
import { askStylist } from "@/server/stylist-chat.functions";
import { getSavedPreferences } from "@/components/StyleQuiz";

type Msg = { role: "user" | "assistant"; content: string };

const STARTER: Msg = {
  role: "assistant",
  content:
    "Hi — I'm your stylist. Tell me about an occasion or vibe and I'll help you build the look.",
};

export function AIStylistButton() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([STARTER]);
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setSending(true);
    try {
      const prefs = getSavedPreferences();
      const res = await askStylist({
        data: {
          messages: next.slice(-10),
          preferences: prefs ?? undefined,
        },
      });
      if (res.error) {
        toast.error(res.error);
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "Sorry — I couldn't reach the stylist just now." },
        ]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Ask AI Stylist"
        className="sm-glow fixed bottom-6 right-6 z-40 inline-flex h-14 items-center gap-2.5 rounded-full bg-gradient-gold px-5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105 active:scale-95 md:bottom-8 md:right-8"
      >
        <Sparkles className="h-4 w-4" strokeWidth={2.25} />
        <span className="hidden sm:inline">Ask AI Stylist</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-end sm:p-6">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-luxe">
            <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-gold">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">AI Stylist</p>
                  <p className="text-[11px] text-muted-foreground">
                    {sending ? "Thinking…" : "Online · curating in real-time"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div ref={scrollerRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm animate-[sm-fade-in_0.3s_ease-out_both] ${
                    m.role === "user"
                      ? "ml-auto rounded-tr-sm bg-gradient-gold text-primary-foreground"
                      : "rounded-tl-sm bg-secondary text-foreground"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {sending && (
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "120ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "240ms" }} />
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={send}
              className="flex items-center gap-2 border-t border-border bg-background/60 p-4"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about style…"
                disabled={sending}
                className="h-11 flex-1 rounded-full border border-border bg-secondary/60 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-gold text-primary-foreground transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
