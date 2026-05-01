import { Search, ShoppingBag, User } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-6 md:px-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-sm bg-foreground" />
          <span className="text-base font-medium tracking-tight">StyleMatch</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#" className="transition-colors hover:text-foreground">For You</a>
          <a href="#" className="transition-colors hover:text-foreground">New</a>
          <a href="#" className="transition-colors hover:text-foreground">Saved</a>
          <a href="#" className="transition-colors hover:text-foreground">Collections</a>
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
          <button className="flex h-10 w-10 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label="Cart">
            <ShoppingBag className="h-[18px] w-[18px]" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label="Account">
            <User className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
