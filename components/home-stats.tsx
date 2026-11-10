"use client";
import { useEffect, useState } from 'react';
import { Package, Sparkles, CalendarDays } from 'lucide-react';
import { api } from '@/lib/api';
import type { ProductList } from '@/lib/catalogue';
export function HomeStats() {
  const [count, setCount] = useState<number>();
  useEffect(() => { api<ProductList>('/products').then(data => setCount(data.activeCount)).catch(() => setCount(undefined)); }, []);
  return <div className="my-6 grid gap-4 sm:grid-cols-3">{[
    { label: 'Active products', value: count === undefined ? '—' : String(count), note: count ? 'Saved and ready in your library' : 'Your catalogue starts with one product', icon: Package },
    { label: 'Saved promotions', value: '—', note: 'Coming with Marketing Studio', icon: Sparkles },
    { label: 'AI allowance', value: '—', note: 'Shown when AI generation is available', icon: CalendarDays },
  ].map(({ label, value, note, icon: Icon }) => <div className="card" key={label}><div className="flex items-center justify-between text-sm text-muted-foreground">{label}<Icon size={18}/></div><p className="my-3 text-3xl font-semibold">{value}</p><p className="text-xs text-muted-foreground">{note}</p></div>)}</div>;
}
