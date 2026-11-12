"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

async function graphicFile(id: string, download = false) {
  const response = await fetch(`/api/studio/graphics/${id}/file${download ? "?download=1" : ""}`, { cache: "no-store" });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Could not open the graphic. Please retry.");
  }
  return response.blob();
}

export function StudioGraphic({ jobId, draftId, offer, service }: {
  jobId: string;
  draftId: string;
  offer: boolean;
  service: boolean;
}) {
  const [layout, setLayout] = useState("spotlight");
  const [format, setFormat] = useState("square");
  const [preview, setPreview] = useState<{ id: string; url: string }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url); }, [preview]);

  async function render() {
    setBusy(true);
    setError("");
    setPreview(undefined);
    try {
      const { id } = await api<{ id: string }>(`/studio/${jobId}/graphics`, {
        method: "POST",
        body: JSON.stringify({ draftId, layout, format }),
      });
      const blob = await graphicFile(id);
      setPreview({ id, url: URL.createObjectURL(blob) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not render the graphic.");
    } finally {
      setBusy(false);
    }
  }

  async function download(id: string) {
    setBusy(true);
    setError("");
    try {
      const url = URL.createObjectURL(await graphicFile(id, true));
      const link = document.createElement("a");
      link.href = url;
      link.download = `marketmate-${id}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download the graphic.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="rounded-lg border p-3">
      <summary className="cursor-pointer font-medium">Branded graphic</summary>
      <div className="mt-3 space-y-3">
        <fieldset disabled={busy} className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">Layout
            <select className="rounded border p-2" value={layout} onChange={event => { setLayout(event.target.value); setPreview(undefined); }}>
              <option value="spotlight">Product spotlight</option>
              {offer && <option value="offer">Offer card</option>}
              {service && <option value="service">Service invitation</option>}
            </select>
          </label>
          <label className="grid gap-1">Size
            <select className="rounded border p-2" value={format} onChange={event => { setFormat(event.target.value); setPreview(undefined); }}>
              <option value="square">Square · 1080 × 1080</option>
              <option value="story">Story · 1080 × 1920</option>
            </select>
          </label>
        </fieldset>
        {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
        <Button type="button" disabled={busy} onClick={() => void render()}>Render preview</Button>
        {busy && <p role="status">Preparing graphic…</p>}
        {preview && <div className="space-y-3">
          <img src={preview.url} alt="Branded graphic from the approved draft" className="max-h-[32rem] w-auto max-w-full rounded-lg border" />
          <Button type="button" disabled={busy} onClick={() => void download(preview.id)}>Download PNG</Button>
        </div>}
      </div>
    </details>
  );
}
