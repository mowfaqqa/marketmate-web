"use client";
import { useEffect, useState } from "react";
import { Package, Sparkles, CalendarDays } from "lucide-react";
import { api } from "@/lib/api";
import type { ProductList } from "@/lib/catalogue";
export function HomeStats() {
  const [count, setCount] = useState<number>();
  const [studio, setStudio] = useState<{
    total: number;
    usage: {
      remaining: number;
      localEnabled: boolean;
      generationEnabled: boolean;
    };
  }>();
  useEffect(() => {
    api<typeof studio>("/studio")
      .then(setStudio)
      .catch(() => setStudio(undefined));
  }, []);
  useEffect(() => {
    api<ProductList>("/products")
      .then((data) => setCount(data.activeCount))
      .catch(() => setCount(undefined));
  }, []);
  return (
    <div className="my-6 grid divide-y divide-border rounded-xl border border-border bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {[
        {
          label: "Active products",
          value: count === undefined ? "—" : String(count),
          note: count
            ? "Saved and ready in your library"
            : "Your catalogue starts with one product",
          icon: Package,
        },
        {
          label: "Saved promotions",
          value: studio ? String(studio.total) : "—",
          note: "Available in Marketing Studio",
          icon: Sparkles,
        },
        {
          label: "AI allowance",
          value: studio?.usage.generationEnabled
            ? String(studio.usage.remaining)
            : "—",
          note: studio?.usage.generationEnabled
            ? studio.usage.localEnabled
              ? "Local sample units remaining"
              : "AI units remaining"
            : "Manual drafts are available",
          icon: CalendarDays,
        },
      ].map(({ label, value, note, icon: Icon }) => (
        <div className="p-4 sm:p-6" key={label}>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            {label}
            <Icon size={18} />
          </div>
          <p className="my-3 text-3xl font-semibold tabular-nums tracking-tight">
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{note}</p>
        </div>
      ))}
    </div>
  );
}
