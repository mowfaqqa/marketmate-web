import Link from "next/link";
import { AccountSummary } from "@/components/account-summary";
import { HomeActivity } from "@/components/home-activity";
import { HomeStats } from "@/components/home-stats";
import { WorkspaceShell } from "@/components/workspace-shell";
import {
  ArrowUpRight,
  CalendarDays,
  Plus,
  Check,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
export default function Page() {
  return (
    <WorkspaceShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold leading-tight tracking-tight">
            Your workspace
          </h1>
          <p className="mt-2 text-muted-foreground">
            Let’s turn what you sell into something worth sharing.
          </p>
        </div>
        <Button asChild>
          <Link href="/studio">
            <Plus size={18} />
            Create promotion
          </Link>
        </Button>
      </div>
      <AccountSummary />
      <HomeStats />
      <HomeActivity />
      <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <section className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Make yourself at home</h2>
            <span className="text-xs text-muted-foreground">
              Getting started
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            A few details now. Easier marketing every day.
          </p>
          <div className="mt-6 space-y-5">
            {[
              {
                title: "Tell us about your business",
                body: "Your name, brand colour and how customers reach you.",
                href: "/settings",
              },
              {
                title: "Add your first product",
                body: "A photo, a description and a confirmed price.",
                href: "/products",
              },
              {
                title: "Create your first promotion",
                body: "Choose your goal and make it your own.",
                href: "/studio",
              },
            ].map((item, i) => (
              <Link
                href={item.href}
                key={item.title}
                className="flex items-center gap-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-sm text-muted-foreground">
                  {i + 1}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">
                    {item.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.body}
                  </span>
                </span>
                <ArrowUpRight size={17} className="text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
        <section className="card flex flex-col">
          <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-primary">
            <CalendarDays size={22} />
          </span>
          <h2 className="text-lg font-semibold">
            A little plan. A whole week.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Bring your products together in a seven-day checklist. You choose
            when and where to share.
          </p>
          <p className="my-5 flex items-center gap-2 text-xs text-muted-foreground">
            <Check size={15} className="text-primary" />
            You review every caption before sharing.
          </p>
          <Button asChild variant="outline" className="mt-auto self-start">
            <Link href="/planner">
              Explore your planner
              <ArrowRight size={16} />
            </Link>
          </Button>
        </section>
      </div>
    </WorkspaceShell>
  );
}
