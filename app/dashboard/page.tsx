import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ImagePlus,
  Store,
  WandSparkles,
} from "lucide-react";
import { AccountSummary } from "@/components/account-summary";
import { HomeActivity } from "@/components/home-activity";
import { HomeStats } from "@/components/home-stats";
import { WorkspaceShell } from "@/components/workspace-shell";
import { Button } from "@/components/ui/button";

const shortcuts = [
  {
    title: "Add a product",
    detail: "Photos, pricing and product details",
    href: "/products/new",
    icon: ImagePlus,
  },
  {
    title: "Plan your week",
    detail: "Review your seven-day posting plan",
    href: "/planner",
    icon: CalendarDays,
  },
  {
    title: "Business profile",
    detail: "Brand colours and contact details",
    href: "/settings",
    icon: Store,
  },
];

export default function Page() {
  return (
    <WorkspaceShell>
      <div className="space-y-6">
        <h1 className="workspace-title">Marketing workspace</h1>
        <section className="grid overflow-hidden rounded-xl bg-primary-hover text-white sm:grid-cols-[1.6fr_1fr]">
          <div className="p-6 sm:p-8">
            <WandSparkles
              aria-hidden="true"
              size={24}
              className="mb-4 text-green-200"
            />
            <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-[32px]">
              Your next promotion
            </h2>
            <p className="mt-2 max-w-sm text-base leading-relaxed text-green-100">
              Choose a product and turn its details into a graphic and caption
              for your customers.
            </p>
            <Button
              asChild
              className="mt-5 bg-white text-primary-hover hover:bg-green-50 active:bg-green-100"
            >
              <Link href="/studio">
                Create promotion <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
          <div
            aria-hidden="true"
            className="order-first h-24 bg-[url('/images/adire-tote.webp')] bg-cover bg-[center_75%] sm:order-last sm:h-auto"
          />
        </section>
        <HomeStats />
        <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <HomeActivity />
          <aside className="grid min-w-0 gap-6">
            <section className="overflow-hidden rounded-xl border border-border bg-white">
              <h2 className="px-5 pt-5 text-xl font-semibold tracking-tight">
                Quick actions
              </h2>
              <div className="divide-y divide-border px-5">
                {shortcuts.map(({ title, detail, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex min-h-16 items-center gap-3 py-4 text-foreground hover:text-primary"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-green-50 text-primary">
                      <Icon size={19} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block text-sm">{title}</strong>
                      <span className="text-sm text-muted-foreground">
                        {detail}
                      </span>
                    </span>
                    <ArrowRight
                      className="shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5"
                      size={16}
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            </section>
            <AccountSummary />
          </aside>
        </div>
      </div>
    </WorkspaceShell>
  );
}
