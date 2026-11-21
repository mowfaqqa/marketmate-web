import { WorkspaceShell } from "@/components/workspace-shell";
import { SalesDetail } from "@/components/sales/sales-detail";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <WorkspaceShell>
      <SalesDetail id={id} />
    </WorkspaceShell>
  );
}
