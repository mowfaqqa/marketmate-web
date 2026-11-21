"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Sale, inputClass, money } from "@/lib/sales";
import { Button } from "@/components/ui/button";
export function SalesList() {
  const [data, setData] = useState<{ items: Sale[]; total: number }>();
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setData(undefined);
    setError("");
    const query = new URLSearchParams({ page: String(page), search });
    if (status) query.set("status", status);
    if (type) query.set("type", type);
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    const timer = setTimeout(() => {
      api<{ items: Sale[]; total: number }>(`/sales-documents?${query}`)
        .then((result) => {
          if (active) setData(result);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [status, type, search, from, to, page, retry]);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Invoices & quotations</h1>
          <p className="mt-2 text-muted-foreground">
            Turn an inquiry into a clear sales document.
          </p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">Create document</Link>
        </Button>
      </div>
      <div className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label>
          Customer or number
          <input
            className={inputClass}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          Type
          <select
            className={inputClass}
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All types</option>
            <option>INVOICE</option>
            <option>QUOTATION</option>
          </select>
        </label>
        <label>
          Status
          <select
            className={inputClass}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {[
              "DRAFT",
              "ISSUED",
              "VOID",
              "UNPAID",
              "PARTIAL",
              "PAID",
              "OVERDUE",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Created from
          <input
            type="date"
            className={inputClass}
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          Created through
          <input
            type="date"
            className={inputClass}
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>
      {error ? (
        <div role="alert">
          {error}{" "}
          <Button variant="outline" onClick={() => setRetry(retry + 1)}>
            Retry
          </Button>{" "}
          <Link className="underline" href="/login">
            Sign in
          </Link>
        </div>
      ) : !data ? (
        <p role="status">Loading documents…</p>
      ) : data.items.length === 0 ? (
        <p className="card">
          No documents match. Create your first invoice or quotation to get
          started.
        </p>
      ) : (
        <div className="space-y-3">
          {data.items.map((row) => (
            <Link
              className="card flex flex-wrap items-center justify-between gap-3"
              key={row.id}
              href={`/invoices/${row.id}`}
            >
              <div>
                <p className="font-semibold">
                  {row.number ?? `Draft ${row.type.toLowerCase()}`}
                </p>
                <p>{row.buyer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {row.overdue ? "OVERDUE · " : ""}
                  {row.status} {row.paymentState ? `· ${row.paymentState}` : ""}{" "}
                  · {row.dueDate}
                </p>
              </div>
              <div>
                <p className="font-semibold">{money(row.totalKobo)}</p>
                {row.type === "INVOICE" && row.status === "ISSUED" && (
                  <p className="text-sm">Remaining {money(row.balanceKobo)}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        <span>Page {page}</span>
        <Button
          variant="outline"
          disabled={!data || page * 20 >= data.total}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Manual payment records are owner-entered and are not verified by a bank.
      </p>
    </div>
  );
}
