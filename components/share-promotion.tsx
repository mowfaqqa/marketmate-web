"use client";
import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

export function SharePromotion({ jobId, draftId, graphicId }: { jobId: string; draftId: string; graphicId?: string }) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [fallback, setFallback] = useState('');
  async function share() {
    setBusy(true); setNotice(''); setFallback('');
    try {
      const { text } = await api<{ text: string }>(`/studio/${jobId}/copy`, { method: 'POST', body: JSON.stringify({ draftId }) });
      let file: File | undefined;
      if (graphicId) {
        const response = await fetch(`/api/studio/graphics/${graphicId}/file?download=1`, { cache: 'no-store' });
        if (!response.ok) { const error = await response.json().catch(() => null); throw new Error(error?.message || 'The graphic could not be shared. Review it and try again.'); }
        file = new File([await response.blob()], `marketmate-${graphicId}.png`, { type: 'image/png' });
      }
      const data: ShareData = { text, ...(file ? { files: [file] } : {}) };
      if (navigator.share && (!file || navigator.canShare?.(data))) {
        try { await navigator.share(data); setNotice('Handed to your chosen app. Check there to finish sharing.'); return; }
        catch (error) { if (error instanceof DOMException && error.name === 'AbortError') { setNotice('Sharing cancelled.'); return; } }
      }
      if (file) {
        const url = URL.createObjectURL(file); const link = document.createElement('a');
        link.href = url; link.download = file.name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      try { await navigator.clipboard.writeText(text); setNotice(file ? 'Graphic downloaded and caption copied. Paste them into your chosen app.' : 'Caption copied. Paste it into your chosen app.'); }
      catch { setFallback(text); setNotice('Copy the caption below manually.' + (file ? ' The graphic was downloaded.' : '')); }
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Sharing failed. Try again.'); }
    finally { setBusy(false); }
  }
  return <div className="space-y-2"><Button type="button" variant="outline" disabled={busy} onClick={() => void share()}>{busy ? 'Preparing…' : graphicId ? 'Share graphic and caption' : 'Share approved caption'}</Button>{notice && <p role="status" className="text-sm">{notice}</p>}{fallback && <textarea aria-label="Caption to copy" readOnly className="w-full rounded border p-2" value={fallback} onFocus={event => event.target.select()} />}</div>;
}
