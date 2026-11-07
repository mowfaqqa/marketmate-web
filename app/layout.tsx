import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'MarketMate — Create. Promote. Sell.', description: 'Your everyday marketing workspace.' };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en-NG"><body>{children}</body></html>; }
