import { Suspense } from 'react';
import { ProductEditor } from '@/components/product-editor';
import { WorkspaceShell } from '@/components/workspace-shell';
export default function Page() {
  return <WorkspaceShell><Suspense fallback={<p role="status">Loading the product editor…</p>}><ProductEditor id="new"/></Suspense></WorkspaceShell>;
}
