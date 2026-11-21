"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Job = { id: string; status: string; channel: string; product: { name: string } };
type Day = { id: string; date: string; theme: string; task: string; job: Job };
type Activity = { today: string; recent: Job[]; pending: Job[]; todayItems: Day[]; overdue: Day[]; overdueCount: number };

export function HomeActivity() {
  const [data, setData] = useState<Activity>();
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const result = await api<Activity>("/dashboard");
        if (!active) return;
        setData(result);
        setError(false);
        timer = setTimeout(load, result.pending.length ? 3000 : 30000);
      } catch {
        if (active) setError(true);
      }
    };
    void load();
    return () => { active = false; clearTimeout(timer); };
  }, [retry]);
  return <section className="my-6" aria-label="Marketing activity">
    <h2 className="mb-3 text-lg font-semibold">Your next steps</h2>
    {error && <p role="status" className="mb-3 text-sm">Activity could not be refreshed. <button className="underline" onClick={() => setRetry(value => value + 1)}>Try again</button></p>}
    {!data && !error && <p role="status" className="text-sm text-muted-foreground">Loading your activity…</p>}
    {data && <div className="grid gap-4 md:grid-cols-2">
      {[
        { title: "Recent drafts", href: "/studio", empty: "Create a promotion to see your drafts here.", rows: data.recent.map(job => ({ id: job.id, title: job.product.name, detail: `${job.channel} · Ready to review` })) },
        { title: "Generation in progress", href: "/studio", empty: "No generation requests waiting.", rows: data.pending.map(job => ({ id: job.id, title: job.product.name, detail: job.status === "running" ? "Generating" : "Waiting to start" })) },
        { title: `Today · ${data.today}`, href: "/planner", empty: "No unfinished tasks today.", rows: data.todayItems.map(day => ({ id: day.id, title: `${day.job.product.name} · ${day.theme}`, detail: day.task })) },
        { title: `Overdue · ${data.overdueCount}`, href: "/planner", empty: "You have no overdue tasks.", rows: data.overdue.map(day => ({ id: day.id, title: day.job.product.name, detail: `${day.date} · ${day.theme}` })) },
      ].map(group => <div className="card" key={group.title}>
        <div className="mb-3 flex items-center justify-between gap-2"><h3 className="font-semibold">{group.title}</h3><Link className="text-sm text-primary underline" href={group.href}>Open</Link></div>
        {group.rows.length ? <ul className="space-y-3">{group.rows.map(row => <li key={row.id}><p className="break-words text-sm font-medium">{row.title}</p><p className="text-xs text-muted-foreground">{row.detail}</p></li>)}</ul> : <p className="text-sm text-muted-foreground">{group.empty}</p>}
      </div>)}
    </div>}
  </section>;
}
