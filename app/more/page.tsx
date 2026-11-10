import Link from 'next/link';
import { CalendarDays, FileText, Settings, ArrowRight } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
export default function Page() {
  return <WorkspaceShell><h1 className="mb-3 text-3xl font-semibold">More for your business</h1><p className="mb-8 text-muted-foreground">Your planning, sales documents and settings.</p><nav aria-label="More" className="space-y-4">{[{ title: 'Planner', href: '/planner', icon: CalendarDays }, { title: 'Invoices', href: '/invoices', icon: FileText }, { title: 'Settings', href: '/settings', icon: Settings }].map(({ title, href, icon: Icon }) => <Link key={href} href={href} className="card flex items-center gap-4"><Icon className="text-primary"/><span className="flex-1 font-medium">{title}</span><ArrowRight size={18}/></Link>)}</nav></WorkspaceShell>;
}
