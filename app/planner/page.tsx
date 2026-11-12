"use client";

import { useEffect, useState, type FormEvent } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { StudioGraphic } from "@/components/studio-graphic";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Product, ProductList } from "@/lib/catalogue";

type Draft = { id: string; text: string; approvedAt: string | null };
type Day = {
  id: string;
  date: string;
  revision: number;
  theme: string;
  task: string;
  completedAt: string | null;
  previousJobIds: string[];
  job: { id: string; productId: string; product: { name: string; archivedAt: string | null; version: number }; facts: { channel: string; expires: string | null; productVersion: number }; drafts: Draft[] };
};
type Plan = { id: string; start: string; goal: string; productIds: string[]; days: Day[] };
type Overview = { today: string; enabled: boolean; usage: { remaining: number }; plans: Plan[] };
const goals = { inquiries: "Get inquiries", offer: "Promote an offer", launch: "Launch a product" };
const dateLabel = (date: string) => new Date(date + "T12:00:00Z").toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric", timeZone: "Africa/Lagos" });
const write = <T,>(path: string, method: "POST" | "PATCH", payload: object) => api<T>(path, { method, body: JSON.stringify(payload) });

function DayCard({ day, plan, overview, products, refresh }: { day: Day; plan: Plan; overview: Overview; products: Product[]; refresh: () => Promise<void> }) {
  const draft = day.job.drafts[0];
  const [date, setDate] = useState(day.date);
  const [channel, setChannel] = useState(day.job.facts.channel);
  const [productId, setProductId] = useState(day.job.productId);
  const [task, setTask] = useState(day.task);
  const [text, setText] = useState(draft.text);
  const [swap, setSwap] = useState(false);
  const [confirmDoneEdit, setConfirmDoneEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copy, setCopy] = useState("");
  const [history, setHistory] = useState<Draft[]>();
  const path = `/planner/${plan.id}/days/${day.id}`;
  const changed = date !== day.date || channel !== day.job.facts.channel || productId !== day.job.productId || task !== day.task || text !== draft.text;
  const stale = day.job.product.archivedAt || day.job.product.version !== day.job.facts.productVersion || (day.job.facts.expires && Date.parse(day.job.facts.expires) <= Date.now());

  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    setCopy("");
    try { await fn(); } catch (err) { setError(err instanceof Error ? err.message : "Please try again."); }
    finally { setBusy(false); }
  }

  async function save(regenerate: boolean) {
    await write(path, "PATCH", { revision: day.revision, date, channel, productId, task, text: regenerate ? undefined : text, swap, regenerate, confirmDoneEdit });
    await refresh();
  }

  return (
    <article className="space-y-3 rounded-xl border bg-white p-4">
      <header>
        <h3 className="font-semibold">{dateLabel(day.date)} · {day.theme}</h3>
        <p className="text-sm text-slate-600">{day.completedAt ? "Marked done by you" : draft.approvedAt && !stale ? "Ready" : "Draft"}{!day.completedAt && day.date < overview.today ? " · Past due" : ""}</p>
      </header>
      {stale && <p role="status" className="text-sm text-amber-800">{day.job.product.archivedAt ? "This product is archived. Choose another product from the plan." : "The product or offer changed. Save and approve a new caption."}</p>}
      <fieldset disabled={busy} className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">Date<select className="rounded border p-2" value={date} onChange={e => setDate(e.target.value)}>{plan.days.map(item => <option key={item.date} value={item.date}>{dateLabel(item.date)}</option>)}</select></label>
        <label className="grid gap-1">Channel<select className="rounded border p-2" value={channel} onChange={e => setChannel(e.target.value)}><option value="instagram">Instagram</option><option value="whatsapp">WhatsApp</option></select></label>
        <label className="grid gap-1">Product<select className="rounded border p-2" value={productId} onChange={e => setProductId(e.target.value)}>{plan.productIds.map(id => <option key={id} value={id} disabled={!products.some(product => product.id === id)}>{products.find(product => product.id === id)?.name ?? plan.days.find(item => item.job.productId === id)?.job.product.name ?? "Archived product"}</option>)}</select></label>
        <label className="grid gap-1">Task<input className="rounded border p-2" maxLength={180} value={task} onChange={e => setTask(e.target.value)} /></label>
        <label className="grid gap-1 sm:col-span-2">Caption<textarea className="min-h-24 rounded border p-2" maxLength={channel === "whatsapp" ? 600 : 1200} value={text} onChange={e => setText(e.target.value)} /></label>
      </fieldset>
      {date !== day.date && <label className="flex gap-2"><input type="checkbox" checked={swap} onChange={e => setSwap(e.target.checked)} /> Swap dates and review both captions again</label>}
      {(day.completedAt || (date !== day.date && plan.days.find(item => item.date === date)?.completedAt)) && <label className="flex gap-2 text-sm"><input type="checkbox" checked={confirmDoneEdit} onChange={e => setConfirmDoneEdit(e.target.checked)} /> An earlier caption may have been shared. Return edited days to draft.</label>}
      <div className="flex flex-wrap gap-2">
        <Button disabled={busy || (!changed && !stale)} onClick={() => void action(() => save(false))}>Save day</Button>
        {overview.enabled && <Button variant="outline" disabled={busy || overview.usage.remaining < 1} onClick={() => void action(() => save(true))}>Regenerate · 1 unit</Button>}
        <Button variant="outline" disabled={busy || changed || !!stale || !!draft.approvedAt} onClick={() => void action(async () => {
          await write(`/studio/${day.job.id}/approve`, "POST", { draftId: draft.id });
          await refresh();
        })}>Approve</Button>
        <Button variant="outline" disabled={busy || changed || !!stale || !draft.approvedAt} onClick={() => void action(async () => {
          const result = await write<{ text: string }>(`/studio/${day.job.id}/copy`, "POST", { draftId: draft.id });
          try { await navigator.clipboard.writeText(result.text); setCopy("Caption copied."); }
          catch { setCopy(result.text); }
        })}>Copy caption</Button>
        <Button variant="outline" disabled={busy || changed || (!day.completedAt && !draft.approvedAt)} onClick={() => void action(async () => {
          await write(path + "/completion", "PATCH", { revision: day.revision, done: !day.completedAt });
          await refresh();
        })}>{day.completedAt ? "Reopen" : "Mark done"}</Button>
      </div>
      {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
      {copy && <p role="status" className="whitespace-pre-wrap text-sm">{copy}</p>}
      {draft.approvedAt && !changed && !stale && <StudioGraphic jobId={day.job.id} draftId={draft.id} offer={!!day.job.facts.expires} service={products.some(product => product.id === day.job.productId && product.type === "SERVICE")} />}
      {day.previousJobIds.length > 0 && <details onToggle={event => {
        if (event.currentTarget.open && !history) void action(async () => {
          const versions = await Promise.all(day.previousJobIds.slice(-10).map(id => api<{ drafts: Draft[] }>(`/studio/${id}`)));
          setHistory(versions.flatMap(version => version.drafts));
        });
      }}><summary className="cursor-pointer text-sm">Previous captions</summary>{history?.map(item => <p key={item.id} className="mt-2 whitespace-pre-wrap text-sm">{item.text}</p>)}</details>}
    </article>
  );
}

function PlannerWorkspace() {
  const [overview, setOverview] = useState<Overview>();
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [start, setStart] = useState("");
  const [goal, setGoal] = useState("inquiries");
  const [key, setKey] = useState("");
  const [open, setOpen] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function refresh() { setOverview(await api<Overview>("/planner")); }
  useEffect(() => {
    void api<Overview>("/planner").then(data => { setOverview(data); setStart(data.today); }).catch(err => setError(err.message));
    void api<ProductList>("/products").then(async first => {
      const more = await Promise.all(Array.from({ length: Math.max(0, Math.ceil(first.total / first.pageSize) - 1) }, (_, i) => api<ProductList>(`/products?page=${i + 2}`)));
      setProducts([first, ...more].flatMap(page => page.items));
    }).catch(err => setError(err.message));
  }, []);
  async function create(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const requestKey = key || crypto.randomUUID();
    setKey(requestKey);
    try {
      const plan = await write<Plan>("/planner", "POST", { key: requestKey, start, goal, productIds: selected });
      await refresh();
      setOpen(plan.id);
      setKey("");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not create the plan."); }
    finally { setBusy(false); }
  }
  const plan = overview?.plans.find(item => item.id === open) ?? overview?.plans[0];
  return <div className="mx-auto max-w-4xl space-y-6">
    <header><h1 className="text-3xl font-semibold">Marketing planner</h1>{overview && <p className="mt-2 text-sm text-slate-600">{overview.usage.remaining} units available · Lagos calendar</p>}</header>
    {error && <p role="alert" className="text-red-800">{error}</p>}
    {overview && <form onSubmit={create} className="space-y-3 rounded-xl border bg-white p-4">
      <h2 className="text-lg font-semibold">Plan seven days</h2>
      <fieldset disabled={busy || !overview.enabled} className="space-y-3" onChange={() => setKey("")}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">Start date<input required type="date" min={overview.today} max={new Date(Date.parse(overview.today) + 30 * 86400000).toISOString().slice(0, 10)} value={start} onChange={e => setStart(e.target.value)} className="rounded border p-2" /></label>
          <label className="grid gap-1">Goal<select value={goal} onChange={e => setGoal(e.target.value)} className="rounded border p-2">{Object.entries(goals).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        </div>
        <fieldset className="grid max-h-44 gap-2 overflow-auto"><legend>Choose up to five active products</legend>{products.map(product => <label key={product.id} className="flex min-h-9 items-center gap-2">
          <input type="checkbox" checked={selected.includes(product.id)} disabled={!selected.includes(product.id) && selected.length >= 5} onChange={e => setSelected(old => e.target.checked ? [...old, product.id] : old.filter(id => id !== product.id))} />{product.name}
        </label>)}</fieldset>
      </fieldset>
      {overview.enabled ? <Button type="submit" disabled={busy || selected.length === 0 || overview.usage.remaining < 3}>Create local sample plan · 3 units</Button> : <p className="text-sm text-slate-600">Plan generation is currently unavailable. You can edit saved plans.</p>}
    </form>}
    {overview && plan && <section className="space-y-4">
      <label className="grid gap-1">Saved plan<select className="rounded border p-2" value={plan.id} onChange={e => setOpen(e.target.value)}>{overview.plans.map(item => <option key={item.id} value={item.id}>{dateLabel(item.start)} · {goals[item.goal as keyof typeof goals]}</option>)}</select></label>
      {plan.days.map(day => <DayCard key={day.id + ":" + day.revision} day={day} plan={plan} overview={overview} products={products} refresh={refresh} />)}
    </section>}
  </div>;
}

export default function PlannerPage() {
  return <WorkspaceShell><PlannerWorkspace /></WorkspaceShell>;
}
