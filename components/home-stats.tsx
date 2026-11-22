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
    <div className="grid divide-y divide-border rounded-xl border border-border bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {[
        {
          label: "Active products",
          value: count === undefined ? "—" : String(count),
          note:
            count === undefined
              ? "Product count unavailable"
              : count
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
          note: !studio
            ? "Allowance unavailable"
            : studio.usage.generationEnabled
              ? studio.usage.localEnabled
                ? "Local sample units remaining"
                : "AI units remaining"
              : "Manual drafts are available",
          icon: CalendarDays,
        },
      ].map(({ label, value, note, icon: Icon }) => (
        <div
          className="grid grid-cols-[1fr_auto] items-center gap-x-3 px-5 py-4 sm:block"
          key={label}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Icon aria-hidden="true" size={17} className="text-primary" />
            {label}
          </div>
          <p className="row-span-2 row-start-1 col-start-2 text-2xl font-semibold tabular-nums tracking-tight text-primary-hover sm:my-2 sm:text-[32px]">
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{note}</p>
        </div>
      ))}
    </div>
  );
}
