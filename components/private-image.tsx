"use client";
import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { api } from '@/lib/api';
export function PrivateImage({ assetId, alt, className = '' }: { assetId: string; alt: string; className?: string }) {
  const [url, setUrl] = useState('');
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    api<{ previewUrl: string }>(`/assets/${assetId}/authorize`, { method: 'POST' })
      .then(data => { if (active) { setUrl(data.previewUrl); setFailed(false); } })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [assetId, attempt]);
  if (failed) return <div className={`flex flex-col items-center justify-center gap-2 bg-slate-50 text-sm text-muted-foreground ${className}`}><ImageOff size={24}/><span>Photo unavailable</span><button className="min-h-11 underline" onClick={() => { setFailed(false); setAttempt(value => value + 1); }}>Retry photo</button></div>;
  if (!url) return <div role="status" className={`animate-pulse bg-slate-100 motion-reduce:animate-none ${className}`}><span className="sr-only">Loading photo</span></div>;
  return <img src={url} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)}/>;
}
