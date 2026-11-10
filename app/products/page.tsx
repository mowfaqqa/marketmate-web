import { Suspense } from 'react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { ProductListView } from '@/components/product-list';
export default function Page() {
  return <WorkspaceShell><Suspense fallback={<p role="status">Loading your library…</p>}><ProductListView/></Suspense></WorkspaceShell>;
}
