"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Sparkles,
  Package,
  CalendarDays,
  FileText,
  Settings,
  Leaf,
  Menu,
} from "lucide-react";
const navigation = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Marketing Studio", href: "/studio", icon: Sparkles },
  { label: "Products", href: "/products", icon: Package },
  { label: "Planner", href: "/planner", icon: CalendarDays },
  { label: "Invoices", href: "/invoices", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const selected = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");
  const section =
    navigation.find(({ href }) => selected(href))?.label ?? "More";
  const moreSelected = ["/more", "/settings", "/invoices", "/planner"].some(
    selected,
  );
  return (
    <div className="min-h-screen lg:pl-64">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3"
        href="#main-content"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-primary-hover text-white px-4 py-6 lg:flex">
        <Link
          href="/dashboard"
          className="flex items-center min-h-11 gap-2 px-2 text-2xl font-bold tracking-tight"
        >
          <span className="rounded-lg bg-white p-2 text-primary-hover">
            <Leaf size={22} />
          </span>
          MarketMate
        </Link>
        <p className="mb-8 mt-1 pl-14 text-xs text-green-100">
          Create. Promote. Sell.
        </p>

        <nav
          aria-label="Main navigation"
          className="space-y-1 border-t border-white/20 pt-5"
        >
          {navigation.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={selected(href) ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm ${selected(href) ? "bg-white font-semibold text-primary-hover" : "text-green-50 hover:bg-white/10"}`}
            >
              <Icon size={19} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-10">
        <Link
          href="/dashboard"
          className="inline-flex min-h-11 items-center gap-2 font-semibold lg:hidden"
        >
          <Leaf size={20} className="text-primary" /> MarketMate
        </Link>
        <span className="hidden items-center gap-3 text-sm text-muted-foreground lg:flex">
          Workspace <span aria-hidden="true">/</span>
          <strong className="font-semibold text-foreground">{section}</strong>
        </span>
        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-primary">
          Development preview
        </span>
      </header>
      <main
        id="main-content"
        className="mx-auto max-w-7xl px-4 sm:px-6 py-8 pb-28 lg:px-10"
      >
        {children}
      </main>
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-border bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {[
          { label: "Home", href: "/dashboard", icon: Home },
          { label: "Create", href: "/studio", icon: Sparkles },
          { label: "Library", href: "/products", icon: Package },
          { label: "More", href: "/more", icon: Menu },
        ].map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={
              selected(href)
                ? "page"
                : href === "/more" && moreSelected
                  ? "location"
                  : undefined
            }
            className={`flex min-h-16 min-w-16 flex-col items-center justify-center gap-1 px-2 text-xs ${(href === "/more" ? moreSelected : selected(href)) ? "font-semibold text-primary" : "text-muted-foreground"}`}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
