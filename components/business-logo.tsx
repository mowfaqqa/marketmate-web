"use client";
import { useEffect, useState } from 'react';
import { api, type Business } from '@/lib/api';
import { Button } from '@/components/ui/button';

type Capacity = { activeProducts: number; storageBytes: number; limits: { activeProducts: number; storageBytes: number } };
export function BusinessLogo({ business, disabled, onSaved, onBusy }: { business: Business; disabled: boolean; onSaved: (business: Business) => void; onBusy: (busy: boolean) => void }) {
  const [file, setFile] = useState<File>();
  const [rights, setRights] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [capacity, setCapacity] = useState<Capacity>();
  const [notice, setNotice] = useState('');
  useEffect(() => { void api<Capacity>('/business/capacity').then(setCapacity).catch(() => setCapacity(undefined)); }, [business.version, busy]);
  async function change(remove = false) {
    setBusy(true); onBusy(true); setError(''); setNotice('');
    try {
      const body = new FormData();
      if (file) body.append('file', file);
      const saved = await api<Business>('/business/logo', {
        method: remove ? 'DELETE' : 'POST', body: remove ? undefined : body,
        headers: { 'x-business-version': String(business.version), 'x-image-rights': rights ? 'confirmed' : '' },
      });
      onSaved(saved); setFile(undefined); setRights(false); setNotice(remove ? 'Logo removed.' : 'Logo saved. New graphics will use it.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save the logo.'); }
    finally { setBusy(false); onBusy(false); }
  }
  return <section className="card my-6 space-y-4">
    <h2 className="text-xl font-semibold">Business logo</h2>
    {business.logoKey && <img src={`/api/business/logo?v=${business.version}`} alt="Your business logo" className="h-24 w-24 rounded border object-contain" />}
    <fieldset disabled={disabled || busy} className="space-y-3">
      <label className="field">Choose a logo<input key={business.version} type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const selected = event.target.files?.[0]; setNotice(''); if (selected && selected.size > 10 * 1024 * 1024) { setError('Choose an image up to 10 MB.'); setFile(undefined); } else { setFile(selected); setError(''); } }} /></label>
      <p className="text-sm text-muted-foreground">Still JPEG, PNG or WebP, up to 10 MB. Transparent backgrounds are preserved.</p>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={rights} onChange={event => setRights(event.target.checked)} />I own this logo or have permission to use it.</label>
      <div className="flex gap-3"><Button disabled={!file || !rights} onClick={() => void change()}>{busy ? 'Saving…' : 'Upload logo'}</Button>{business.logoKey && <Button variant="outline" onClick={() => void change(true)}>Remove logo</Button>}</div>
    </fieldset>
    {disabled && <p className="text-sm">Save or resolve your profile edits before changing the logo.</p>}
    {error && <p role="alert" className="text-red-800">{error}</p>}{notice && <p role="status">{notice}</p>}
    {capacity && <p className="text-sm text-muted-foreground">{capacity.activeProducts} / {capacity.limits.activeProducts} active products · {(capacity.storageBytes / 1048576).toFixed(1)} / {(capacity.limits.storageBytes / 1048576).toFixed(1)} MB storage (including reserved uploads)</p>}
  </section>;
}
