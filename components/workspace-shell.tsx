"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Package, CalendarDays, FileText, Settings, Leaf, Menu } from 'lucide-react';
const navigation = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Marketing Studio', href: '/studio', icon: Sparkles },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Planner', href: '/planner', icon: CalendarDays },
  { label: 'Invoices', href: '/invoices', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings },
];
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const selected = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);
  return <div className="min-h-screen lg:pl-64">
    <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3" href="#main-content">Skip to content</a>
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-white p-6 lg:flex">
      <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight"><span className="rounded-lg bg-primary p-2 text-white"><Leaf size={22}/></span>MarketMate</Link>
      <p className="mb-10 mt-2 pl-11 text-xs text-muted-foreground">Create. Promote. Sell.</p>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Workspace</p>
      <nav aria-label="Main navigation" className="space-y-2">{navigation.map(({ label, href, icon: Icon }) => <Link key={href} href={href} aria-current={selected(href) ? 'page' : undefined} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm ${selected(href) ? 'bg-green-50 font-semibold text-primary' : 'text-muted-foreground hover:bg-slate-50'}`}><Icon size={19}/>{label}</Link>)}</nav>
      <div className="mt-auto rounded-xl bg-slate-50 p-4 text-sm"><p className="font-semibold">Built for your next sale</p><p className="mt-2 text-muted-foreground">A little consistency goes a long way.</p></div>
    </aside>
    <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-10"><Link href="/" className="font-semibold lg:hidden">MarketMate</Link><span className="hidden font-semibold lg:inline">Your workspace</span><span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-primary">Development preview</span></header>
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-8 pb-28 lg:px-10">{children}</main>
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-border bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">{[
      { label: 'Home', href: '/', icon: Home }, { label: 'Create', href: '/studio', icon: Sparkles },
      { label: 'Library', href: '/products', icon: Package }, { label: 'More', href: '/more', icon: Menu },
    ].map(({ label, href, icon: Icon }) => <Link key={href} href={href} aria-current={selected(href) ? 'page' : undefined} className={`flex min-h-16 min-w-16 flex-col items-center justify-center gap-1 px-2 text-xs ${selected(href) ? 'font-semibold text-primary' : 'text-muted-foreground'}`}><Icon size={20}/>{label}</Link>)}</nav>
  </div>;
}
