import { Search, ShoppingBag, User, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useSavedItems } from "@/hooks/useSavedItems";

export function Navbar() {
  const { ids } = useSavedItems();
  const savedCount = ids.length;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-6 md:px-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-sm bg-foreground" />
          <span className="text-base font-medium tracking-tight">StyleMatch</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link
            to="/"
            activeProps={{ className: "text-foreground" }}
            activeOptions={{ exact: true }}
            className="transition-colors hover:text-foreground"
          >
            For You
          </Link>
          <Link
            to="/saved"
            activeProps={{ className: "text-foreground" }}
            className="transition-colors hover:text-foreground"
          >
            Saved
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search items, styles, brands"
              className="h-10 w-72 rounded-sm border border-border bg-secondary/50 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-foreground focus:bg-background focus:outline-none"
            />
          </div>
          <Link
            to="/saved"
            aria-label={`Saved (${savedCount})`}
            className="relative flex h-10 w-10 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Heart className="h-[18px] w-[18px]" />
            {savedCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium leading-none text-background">
                {savedCount > 99 ? "99+" : savedCount}
              </span>
            )}
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Cart"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Account"
          >
            <User className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
