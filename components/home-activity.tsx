"use client";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  FilePenLine,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Job = {
  id: string;
  status: string;
  channel: string;
  product: { name: string };
};
type Day = { id: string; date: string; theme: string; task: string; job: Job };
type Activity = {
  today: string;
  recent: Job[];
  pending: Job[];
  todayItems: Day[];
  overdue: Day[];
  overdueCount: number;
};

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
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [retry]);
  return (
    <section
      className="min-w-0 rounded-xl border border-border bg-white p-5 sm:p-6"
      aria-label="Marketing activity"
    >
      <h2 className="mb-2 text-xl font-semibold tracking-tight">
        Marketing activity
      </h2>
      {error && (
        <p role="status" className="mb-3 text-sm">
          Activity could not be refreshed.{" "}
          <button
            className="inline-flex min-h-11 items-center px-2 font-semibold text-primary underline"
            onClick={() => setRetry((value) => value + 1)}
          >
            Try again
          </button>
        </p>
      )}
      {!data && !error && (
        <p role="status" className="text-sm text-muted-foreground">
          Loading your activity…
        </p>
      )}
      {data && (
        <div className="divide-y divide-border">
          {[
            {
              icon: FilePenLine,
              title: "Recent drafts",
              href: "/studio",
              empty: "Create a promotion to see your drafts here.",
              rows: data.recent.map((job) => ({
                id: job.id,
                title: job.product.name,
                detail: `${job.channel} · Ready to review`,
              })),
            },
            {
              icon: Timer,
              title: "Generation in progress",
              href: "/studio",
              empty: "No generation requests waiting.",
              rows: data.pending.map((job) => ({
                id: job.id,
                title: job.product.name,
                detail:
                  job.status === "running" ? "Generating" : "Waiting to start",
              })),
            },
            {
              icon: CalendarDays,
              title: `Today · ${data.today}`,
              href: "/planner",
              empty: "No unfinished tasks today.",
              rows: data.todayItems.map((day) => ({
                id: day.id,
                title: `${day.job.product.name} · ${day.theme}`,
                detail: day.task,
              })),
            },
            {
              icon: Clock3,
              title: `Overdue · ${data.overdueCount}`,
              href: "/planner",
              empty: "You have no overdue tasks.",
              rows: data.overdue.map((day) => ({
                id: day.id,
                title: day.job.product.name,
                detail: `${day.date} · ${day.theme}`,
              })),
            },
          ].map((group) => (
            <div className="py-3" key={group.title}>
              <h3>
                <Link
                  href={group.href}
                  className="flex min-h-11 items-center gap-3 rounded-lg text-base font-semibold hover:text-primary"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-background text-primary">
                    <group.icon size={17} aria-hidden="true" />
                  </span>
                  <span className="flex-1">{group.title}</span>
                  <ArrowUpRight aria-hidden="true" size={16} />
                </Link>
              </h3>
              {group.rows.length ? (
                <ul className="ml-11 space-y-3 pb-1">
                  {group.rows.map((row) => (
                    <li key={row.id}>
                      <p className="break-words text-sm font-medium">
                        {row.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="ml-11 text-sm text-muted-foreground">
                  {group.empty}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
