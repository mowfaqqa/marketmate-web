import { Suspense } from 'react';
import { ProductEditor } from '@/components/product-editor';
import { WorkspaceShell } from '@/components/workspace-shell';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkspaceShell><Suspense fallback={<p role="status">Loading your product…</p>}><ProductEditor id={id}/></Suspense></WorkspaceShell>;
}
