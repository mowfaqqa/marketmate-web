"use client";
import { useAutosave } from "@/hooks/use-autosave";
import { SharePromotion } from "@/components/share-promotion";

import { useCallback, useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { StudioGraphic } from "@/components/studio-graphic";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { money, type ProductList, type Product } from "@/lib/catalogue";

type Facts = {
  productVersion: number;
  businessVersion: number;
  product: string;
  brand: string;
  contact: string;
  price: number | null;
  expires: string | null;
  goal: string;
  channel: string;
  tone: string;
};
type Draft = {
  id: string;
  variant: number;
  revision: number;
  text: string;
  approvedAt: string | null;
};
type Job = {
  id: string;
  productId: string;
  facts: Facts;
  status: string;
  error: string | null;
  archived: boolean;
  createdAt: string;
  drafts: Draft[];
};
type Overview = {
  usage: {
    used: number;
    reserved: number;
    remaining: number;
    end: string;
    localEnabled: boolean;
    generationEnabled: boolean;
    generationMode: string;
  };
  jobs: Job[];
};
const channels = {
  instagram: "Instagram caption",
  whatsapp: "WhatsApp sales message",
  description: "Product description",
  ideas: "Campaign ideas",
};
const goals = {
  inquiries: "Get inquiries",
  offer: "Promote an offer",
  launch: "Launch a product",
};
const post = <T,>(path: string, body: object) =>
  api<T>(path, { method: "POST", body: JSON.stringify(body) });

function StudioWorkspace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [overview, setOverview] = useState<Overview>();
  const [job, setJob] = useState<Job>();
  const [productId, setProductId] = useState("");
  const [goal, setGoal] = useState("inquiries");
  const [channel, setChannel] = useState("instagram");
  const [tone, setTone] = useState("friendly");
  const [preview, setPreview] = useState<Facts>();
  const [sourceDraftId, setSourceDraftId] = useState<string>();
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [autosaveConflict, setAutosaveConflict] = useState(false);
  const [edits, setEdits] = useState<Record<string, string>>({});

  const refresh = useCallback(
    async () => setOverview(await api<Overview>("/studio")),
    [],
  );
  useEffect(() => {
    const load = async () => {
      const first = await api<ProductList>("/products");
      const pages = Math.ceil(first.total / first.pageSize);
      const rest = await Promise.all(
        Array.from({ length: Math.max(0, pages - 1) }, (_, index) =>
          api<ProductList>(`/products?page=${index + 2}`),
        ),
      );
      const items = [first, ...rest].flatMap((page) => page.items);
      setProducts(items);
      setProductId(items[0]?.id ?? "");
    };
    void Promise.all([load(), refresh()]).catch((err) => setError(err.message));
  }, [refresh]);

  const jobId = job?.id;
  const jobStatus = job?.status;
  useEffect(() => {
    if (!jobId || !["pending", "running"].includes(jobStatus ?? "")) return;
    let cancelled = false;
    const timer = setInterval(() => {
      void api<Job>(`/studio/${jobId}`)
        .then((next) => {
          if (cancelled) return;
          setJob(next);
          if (!["pending", "running"].includes(next.status)) return refresh();
        })
        .catch((err) => {
          if (!cancelled) setError(err.message);
        });
    }, 2000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [jobId, jobStatus, refresh]);

  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setAutosaveConflict(true);
      setError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const brief = { productId, goal, channel, tone };
  const latest =
    job?.drafts.filter(
      (draft, index, all) =>
        all.findIndex((item) => item.variant === draft.variant) === index,
    ) ?? [];
  const changedDraft = latest.find(draft => edits[draft.id] !== undefined && edits[draft.id] !== draft.text);
  const online = useAutosave({
    dirty: !!changedDraft, revision: JSON.stringify(edits),
    blocked: busy || autosaveConflict || !!error || !!job?.archived || !changedDraft || !edits[changedDraft.id]?.trim(),
    reconnect: () => setError(""),
    save: () => { if (job && changedDraft) void action(async () => {
      const saved = await post<Draft>(`/studio/${job.id}/edit`, { draftId: changedDraft.id, text: edits[changedDraft.id] });
      setJob(current => current?.id === job.id ? { ...current, drafts: [saved, ...current.drafts] } : current);
      setEdits(current => { const next = { ...current }; delete next[changedDraft.id]; return next; });
      setNotice("Revision saved. Review it before approving.");
    }); },
  });
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Marketing Studio</h1>
        {overview && (
          <p className="mt-2 text-sm text-slate-600">
            {overview.usage.remaining} units available · {overview.usage.used}{" "}
            used · {overview.usage.reserved} reserved · Resets{" "}
            {new Date(overview.usage.end).toLocaleDateString("en-NG", {
              timeZone: "Africa/Lagos",
            })}
          </p>
        )}
      </header>
      {error && (
        <p
          role="alert"
          className="rounded border border-red-300 bg-red-50 p-3 text-red-800"
        >
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-emerald-800">
          {notice}
        </p>
      )}
      {overview?.usage.generationMode === "openai" && (
        <p className="text-sm text-slate-600">
          Generation sends selected product facts and your business name to
          OpenAI. Review every draft before sharing.
        </p>
      )}
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Promotion brief</h2>
        <fieldset
          disabled={busy}
          className="grid gap-4 sm:grid-cols-2"
          onChange={() => {
            setPreview(undefined);
            setKey("");
            setSourceDraftId(undefined);
          }}
        >
          <label className="grid gap-1">
            Product
            <select
              className="rounded border p-2"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              {!products.length && (
                <option value="">Add an active product first</option>
              )}
              {products.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            Goal
            <select
              className="rounded border p-2"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            >
              {Object.entries(goals).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            Output
            <select
              className="rounded border p-2"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              {Object.entries(channels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            Tone
            <select
              className="rounded border p-2"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              {["friendly", "professional", "energetic"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </fieldset>
        <Button
          disabled={busy || !productId}
          onClick={() =>
            void action(async () => {
              const nextKey = crypto.randomUUID();
              setPreview(
                await post<Facts>("/studio/preview", {
                  ...brief,
                  key: nextKey,
                  manual: true,
                }),
              );
              setKey(nextKey);
            })
          }
        >
          Review facts
        </Button>
        {preview && (
          <div className="space-y-3 rounded-lg bg-slate-50 p-4">
            <p className="font-medium">
              {preview.product} · {preview.brand}
            </p>
            <p>
              {preview.price === null
                ? "Price on request"
                : money(preview.price)}{" "}
              · {preview.contact}
            </p>
            {preview.expires && (
              <p>
                Offer ends{" "}
                {new Date(preview.expires).toLocaleString("en-NG", {
                  timeZone: "Africa/Lagos",
                })}{" "}
                (Lagos time)
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {(sourceDraftId ? [true] : [true, false]).map(
                (manual) =>
                  (manual || overview?.usage.generationEnabled) && (
                    <Button
                      key={String(manual)}
                      disabled={busy || !key}
                      onClick={() =>
                        void action(async () => {
                          const started = await post<Job>("/studio", {
                            ...brief,
                            key,
                            manual,
                            productVersion: preview.productVersion,
                            businessVersion: preview.businessVersion,
                            sourceDraftId,
                          });
                          setJob(await api<Job>(`/studio/${started.id}`));
                          setKey("");
                          setSourceDraftId(undefined);
                          setPreview(undefined);
                          await refresh();
                        })
                      }
                    >
                      {manual
                        ? sourceDraftId
                          ? "Duplicate draft · 0 units"
                          : "Start manual draft · 0 units"
                        : overview?.usage.localEnabled
                          ? "Generate local samples · 1 unit"
                          : "Generate with AI · 1 unit"}
                    </Button>
                  ),
              )}
            </div>
            {!overview?.usage.generationEnabled && (
              <p className="text-sm text-slate-600">
                Generation is unavailable. You can write a manual draft.
              </p>
            )}
          </div>
        )}
      </section>
      {job && (
        <section className="space-y-4 rounded-xl border bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">
              {job.facts.product} drafts
            </h2>
            {!["pending", "running"].includes(job.status) && (
              <Button
                disabled={busy}
                onClick={() =>
                  void action(async () => {
                    await post(`/studio/${job.id}/archive`, {
                      archived: !job.archived,
                    });
                    setJob(await api<Job>(`/studio/${job.id}`));
                    await refresh();
                  })
                }
              >
                {job.archived ? "Reopen" : "Archive"}
              </Button>
            )}
          </div>
          {["pending", "running"].includes(job.status) && (
            <p role="status">
              {job.status === "running"
                ? "Preparing your drafts…"
                : "Generation queued…"}{" "}
              You can leave and return.
            </p>
          )}
          {job.error && <p role="alert">{job.error}</p>}
          {latest.map((draft) => {
            const edited = edits[draft.id] ?? draft.text;
            const change = edited !== draft.text;
            return (
              <div key={draft.id} className="space-y-2 rounded-lg border p-4">
                <label className="grid gap-2">
                  Variant {draft.variant}, revision {draft.revision}
                  {draft.approvedAt ? " · Approved" : ""}
                  <textarea
                    className="min-h-28 rounded border p-2"
                    disabled={job.archived || busy}
                    value={edited}
                    onChange={(e) =>
                      (setError(""), setEdits((old) => ({
                        ...old,
                        [draft.id]: e.target.value,
                      })))
                    }
                  />
                </label>
                <p role="status" className="text-sm text-muted-foreground">{change ? (online ? "Unsaved changes · autosave pending" : "Offline · changes remain in this tab") : "Saved revision"}</p>
                <div className="flex flex-wrap gap-2">
                  {(["edit", "approve", "copy"] as const).map((operation) => (
                    <Button
                      key={operation}
                      disabled={
                        busy ||
                        job.archived ||
                        (operation === "edit"
                          ? !change
                          : change ||
                            (operation === "copy"
                              ? !draft.approvedAt
                              : !!draft.approvedAt))
                      }
                      onClick={() =>
                        void action(async () => {
                          const result = await post<{ text: string }>(
                            `/studio/${job.id}/${operation}`,
                            {
                              draftId: draft.id,
                              ...(operation === "edit" ? { text: edited } : {}),
                            },
                          );
                          if (operation === "copy") {
                            await navigator.clipboard.writeText(result.text);
                            setNotice("Approved copy copied.");
                          } else setJob(await api<Job>(`/studio/${job.id}`));
                        })
                      }
                    >
                      {operation === "edit"
                        ? "Save revision"
                        : operation === "approve"
                          ? "Approve"
                          : "Copy approved text"}
                    </Button>
                  ))}
                </div>
                {draft.approvedAt && !job.archived && !change && <SharePromotion jobId={job.id} draftId={draft.id} />}
                {draft.approvedAt && !job.archived && !change && (
                  <StudioGraphic
                    jobId={job.id}
                    draftId={draft.id}
                    offer={!!job.facts.expires}
                    service={products.some(
                      (product) =>
                        product.id === job.productId &&
                        product.type === "SERVICE",
                    )}
                  />
                )}
                <Button
                  disabled={
                    busy ||
                    !products.some((product) => product.id === job.productId)
                  }
                  onClick={() =>
                    void action(async () => {
                      const nextKey = crypto.randomUUID();
                      const next = {
                        productId: job.productId,
                        goal: job.facts.goal,
                        channel: job.facts.channel,
                        tone: job.facts.tone,
                        key: nextKey,
                        manual: true,
                      };
                      const current = await post<Facts>(
                        "/studio/preview",
                        next,
                      );
                      setProductId(next.productId);
                      setGoal(next.goal);
                      setChannel(next.channel);
                      setTone(next.tone);
                      setKey(nextKey);
                      setSourceDraftId(draft.id);
                      setPreview(current);
                      setNotice(
                        "Review the current facts in the brief, then duplicate this revision.",
                      );
                    })
                  }
                >
                  Use as a new draft
                </Button>
                <details>
                  <summary className="cursor-pointer text-sm">
                    Report a problem
                  </summary>
                  <div className="mt-2 flex gap-2">
                    {["facts", "language"].map((issue) => (
                      <Button
                        key={issue}
                        disabled={busy}
                        onClick={() =>
                          void action(async () => {
                            await post(`/studio/${job.id}/feedback`, {
                              draftId: draft.id,
                              issue,
                            });
                            setNotice("Feedback saved.");
                          })
                        }
                      >
                        {issue === "facts"
                          ? "Factual problem"
                          : "Language problem"}
                      </Button>
                    ))}
                  </div>
                </details>
                <details>
                  <summary className="cursor-pointer text-sm">
                    Revision history
                  </summary>
                  {job.drafts
                    .filter((item) => item.variant === draft.variant)
                    .map((item) => (
                      <p
                        key={item.id}
                        className="mt-2 whitespace-pre-wrap text-sm"
                      >
                        Revision {item.revision} · {item.text || "Empty draft"}
                      </p>
                    ))}
                </details>
              </div>
            );
          })}
        </section>
      )}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Saved work</h2>
        {overview?.jobs.map((item) => (
          <button
            className="block w-full rounded border bg-white p-3 text-left"
            disabled={busy}
            key={item.id}
            onClick={() =>
              void action(async () => {
                if (changedDraft && !confirm("Open saved work? Copy any unsaved text first.")) return;
                setJob(await api<Job>(`/studio/${item.id}`));
                setAutosaveConflict(false);
              })
            }
          >
            {item.facts.product} ·{" "}
            {channels[item.facts.channel as keyof typeof channels]} ·{" "}
            {goals[item.facts.goal as keyof typeof goals]} ·{" "}
            {new Date(item.createdAt).toLocaleDateString("en-NG")} ·{" "}
            {item.archived ? "Archived" : item.status}
          </button>
        ))}
      </section>
    </div>
  );
}

export default function StudioPage() {
  return (
    <WorkspaceShell>
      <StudioWorkspace />
    </WorkspaceShell>
  );
}
