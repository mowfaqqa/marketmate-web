"use client";
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
type Mode = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email';
const titles: Record<Mode, string> = { login: 'Welcome back.', register: 'Make room for your next sale.', 'forgot-password': 'Let’s get you back in.', 'reset-password': 'Choose a new password.', 'verify-email': 'Confirm your email.' };
export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [rawToken, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { const value = new URLSearchParams(location.hash.slice(1)).get('token') || ''; setToken(value); if (value) history.replaceState(null, '', location.pathname); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    const data = new FormData(event.currentTarget);
    const endpoint = mode === 'verify-email' ? 'verify' : mode;
    const payload = mode === 'verify-email' ? { token: rawToken } : mode === 'reset-password' ? { token: rawToken, password: data.get('password') } : mode === 'forgot-password' ? { email: data.get('email') } : { email: data.get('email'), password: data.get('password') };
    try {
      const result = await api<{ message: string }>(`/auth/${endpoint}`, { method: 'POST', body: JSON.stringify(payload) });
      if (mode === 'login' || mode === 'register') { router.push('/settings'); router.refresh(); } else setMessage(result.message);
    } catch (err) { setError(err instanceof Error ? err.message : 'Please try again.'); } finally { setBusy(false); }
  }
  return <main className="grid min-h-screen lg:grid-cols-2"><section className="hidden flex-col justify-between bg-primary p-12 text-white lg:flex"><Link href="/" className="flex items-center gap-2 text-2xl font-bold"><Leaf/>MarketMate</Link><div><p className="mb-6 text-sm text-green-200">CREATE. PROMOTE. SELL.</p><h1 className="max-w-lg text-5xl font-semibold leading-tight">Small business.<br/>Fresh possibilities.</h1><p className="mt-6 max-w-md text-green-100">Your products, your voice and a little help turning everyday ideas into your next promotion.</p></div><p className="text-sm text-green-200">Made for the business you’re building.</p></section><section className="flex items-center justify-center p-6 py-12"><div className="w-full max-w-md"><Link href="/" className="mb-10 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16}/>Back to home</Link><h1 className="text-3xl font-semibold tracking-tight">{titles[mode]}</h1><p className="mb-8 mt-3 text-muted-foreground">{mode === 'register' ? 'Create your account, then tell us about your business.' : mode === 'verify-email' ? 'Use the button below to verify the link from your email.' : 'Your workspace is ready when you are.'}</p><form onSubmit={submit} className="space-y-5">{['login', 'register', 'forgot-password'].includes(mode) && <label className="field">Email address<input name="email" type="email" autoComplete="email" maxLength={254} required placeholder="you@yourbusiness.com"/></label>}{['login', 'register', 'reset-password'].includes(mode) && <label className="field">Password<input name="password" type="password" minLength={12} maxLength={128} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required/><span className="text-xs font-normal text-muted-foreground">Use at least 12 characters.</span></label>}{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}{message && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-primary">{message}</p>}{!message && <Button className="w-full" disabled={busy || (['verify-email', 'reset-password'].includes(mode) && !rawToken)}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : mode === 'forgot-password' ? 'Send reset link' : mode === 'reset-password' ? 'Save new password' : 'Verify email'}</Button>}{['verify-email', 'reset-password'].includes(mode) && !rawToken && <p className="text-sm text-muted-foreground">Open the full link from your email. Used or expired links can be replaced.</p>}</form><div className="mt-6 flex flex-wrap justify-between gap-3 text-sm text-primary">{mode === 'login' ? <><Link href="/register">Create an account</Link><Link href="/forgot-password">Forgot password?</Link></> : <Link href="/login">Return to sign in</Link>}{mode === 'verify-email' && <Link href="/settings">Continue to your business</Link>}</div></div></section></main>;
}
