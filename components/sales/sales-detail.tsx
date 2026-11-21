"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Sale, inputClass, money, today } from "@/lib/sales";
import { Button } from "@/components/ui/button";
import { SalesEditor } from "./sales-editor";
export function SalesDetail({ id }: { id: string }) {
  const router = useRouter();
  const [sale, setSale] = useState<Sale>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [taxConfirmed, setTaxConfirmed] = useState(false);
  const [reason, setReason] = useState("");
  const [payment, setPayment] = useState({
    amount: "",
    date: today(),
    method: "BANK_TRANSFER",
    reference: "",
  });
  const keys = useRef(new Map<string, string>());
  const load = useCallback(async () => {
    try {
      setSale(await api<Sale>(`/sales-documents/${id}`));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, [id]);
  useEffect(() => {
    void load();
  }, [load]);
  const pending =
    sale?.pdfStatus === "PENDING" || sale?.pdfStatus === "WORKING";
  useEffect(() => {
    if (!pending || editing) return;
    const timer = setInterval(() => {
      void load();
    }, 2000);
    return () => clearInterval(timer);
  }, [pending, editing, load]);
  async function action(
    path: string,
    input: unknown,
    confirmation?: string,
    redirect = false,
  ) {
    if (confirmation && !confirm(confirmation)) return;
    setBusy(true);
    setError("");
    const fingerprint = JSON.stringify([path, input]);
    if (!keys.current.has(fingerprint))
      keys.current.set(fingerprint, crypto.randomUUID());
    try {
      const result = await api<Sale>(path, {
        method: "POST",
        headers: { "Idempotency-Key": keys.current.get(fingerprint)! },
        body: JSON.stringify(input),
      });
      if (redirect) router.push(`/invoices/${result.id}`);
      else {
        setSale(result);
        setPayment((p) => ({ ...p, amount: "", reference: "" }));
        setReason("");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function download(history = false) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `/api/sales-documents/${id}/${history ? "history-download" : "download"}`,
        { cache: "no-store" },
      );
      if (!response.ok)
        throw new Error((await response.json()).message || "Download failed.");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = history
        ? `sales-history-${id}.json`
        : `${sale?.status === "VOID" ? "VOID-" : ""}${sale?.number ?? "draft"}.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!sale)
    return (
      <div role={error ? "alert" : "status"}>
        {error || "Loading document…"}
        {error && <Button onClick={() => void load()}>Retry</Button>}
      </div>
    );
  if (editing)
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => {
            if (
              confirm(
                "Return to the saved document? Unsaved edits will be discarded.",
              )
            )
              setEditing(false);
          }}
        >
          Back to saved document
        </Button>
        <SalesEditor
          sale={sale}
          onSaved={(result) => {
            setSale(result);
            setEditing(false);
          }}
        />
      </div>
    );
  return (
    <div className="space-y-5">
      <Link className="underline" href="/invoices">
        All documents
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">
            {sale.number ?? `Draft ${sale.type.toLowerCase()}`}
          </h1>
          <p>
            {sale.status} {sale.paymentState ? `· ${sale.paymentState}` : ""}
            {sale.overdue ? " · OVERDUE" : ""}
          </p>
        </div>
        {sale.status === "DRAFT" && (
          <Button disabled={busy} onClick={() => setEditing(true)}>
            Edit draft
          </Button>
        )}
      </div>
      {error && (
        <div role="alert" className="rounded border border-red-200 p-3">
          {error}
          <Button variant="outline" disabled={busy} onClick={() => void load()}>
            Reload saved record
          </Button>
        </div>
      )}
      {sale.voidReason && (
        <p className="rounded bg-red-50 p-3">VOID — {sale.voidReason}</p>
      )}
      <section className="card grid gap-4 sm:grid-cols-2">
        <div>
          <h2 className="font-semibold">From</h2>
          <p>{sale.seller.name}</p>
          <p>{sale.seller.location}</p>
          <p>{sale.seller.contact}</p>
        </div>
        <div>
          <h2 className="font-semibold">To</h2>
          <p>{sale.buyer.name}</p>
          <p className="whitespace-pre-wrap">{sale.buyer.address}</p>
          <p>{sale.buyer.phone}</p>
          <p>{sale.buyer.email}</p>
        </div>
        <p>Issue date: {sale.issueDate ?? "Not issued"}</p>
        <p>
          {sale.type === "QUOTATION" ? "Valid until" : "Due date"}:{" "}
          {sale.dueDate}
        </p>
      </section>
      <section className="card space-y-4">
        <h2 className="font-semibold">Items</h2>
        {sale.lines.map((line, index) => (
          <div key={index} className="border-b border-border pb-3">
            <p className="font-medium">
              {index + 1}. {line.description}
            </p>
            <p>
              {line.quantity} × {money(line.unitPriceKobo)}
            </p>
            <p className="text-sm">
              Discount {money(line.discountKobo)} · Tax{" "}
              {(Number(line.taxRate) * 100).toFixed(2)}%:{" "}
              {money(line.taxKobo ?? 0)}
            </p>
            <p>{money(line.totalKobo ?? 0)}</p>
          </div>
        ))}
        <dl className="grid grid-cols-2 gap-2">
          <dt>Subtotal</dt>
          <dd>{money(sale.totals.subtotalKobo)}</dd>
          <dt>Discounts</dt>
          <dd>{money(sale.totals.discountKobo)}</dd>
          <dt>Delivery</dt>
          <dd>{money(sale.totals.deliveryKobo)}</dd>
          {Object.entries(sale.totals.taxByRate).map(([rate, tax]) => (
            <div key={rate} className="col-span-2 grid grid-cols-2">
              <dt>Tax {(Number(rate) * 100).toFixed(2)}%</dt>
              <dd>{money(tax)}</dd>
            </div>
          ))}
          <dt className="font-bold">Total</dt>
          <dd className="font-bold">{money(sale.totalKobo)}</dd>
          {sale.type === "INVOICE" && sale.status === "ISSUED" && (
            <>
              <dt>Recorded payments</dt>
              <dd>{money(sale.paidKobo)}</dd>
              <dt>Remaining</dt>
              <dd>{money(sale.balanceKobo)}</dd>
            </>
          )}
        </dl>
      </section>
      {(sale.notes || sale.paymentInstructions) && (
        <section className="card space-y-3">
          <h2 className="font-semibold">Notes & payment instructions</h2>
          <p className="whitespace-pre-wrap">{sale.notes}</p>
          <p className="whitespace-pre-wrap">{sale.paymentInstructions}</p>
        </section>
      )}
      <fieldset disabled={busy} className="card space-y-4">
        <legend className="font-semibold">Document actions</legend>
        {sale.status === "DRAFT" && (
          <>
            <label className="flex gap-3">
              <input
                type="checkbox"
                checked={taxConfirmed}
                onChange={(e) => setTaxConfirmed(e.target.checked)}
              />
              <span>
                I have reviewed and confirmed the selected tax settings.
              </span>
            </label>
            <Button
              onClick={() =>
                void action(
                  `/sales-documents/${id}/issue`,
                  { version: sale.version, taxConfirmed },
                  "Issue this document? Its number and financial details will be permanent. Corrections require voiding and a replacement.",
                )
              }
            >
              Issue {sale.type.toLowerCase()}
            </Button>
          </>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            disabled={pending}
            onClick={() =>
              void action(`/sales-documents/${id}/pdf`, {
                version: sale.version,
              })
            }
          >
            {sale.pdfStatus === "FAILED" ? "Retry PDF" : "Prepare PDF"}
          </Button>
          <Button
            variant="outline"
            disabled={sale.pdfStatus !== "READY"}
            onClick={() => void download()}
          >
            Download PDF
          </Button>
          <Button variant="outline" onClick={() => void download(true)}>
            Export document history
          </Button>
          <span role="status">
            {pending
              ? "Preparing PDF… You can leave and return."
              : sale.pdfStatus === "READY"
                ? "PDF ready"
                : (sale.pdfError ?? "")}
          </span>
        </div>
        {sale.status === "ISSUED" &&
          sale.type === "QUOTATION" &&
          !sale.convertedInvoice && (
            <Button
              variant="outline"
              onClick={() =>
                void action(
                  `/sales-documents/${id}/convert`,
                  { version: sale.version },
                  "Create an invoice draft using this quotation’s saved prices and customer details?",
                  true,
                )
              }
            >
              Convert to invoice draft
            </Button>
          )}
        {sale.status === "VOID" && !sale.replacement && (
          <Button
            variant="outline"
            onClick={() =>
              void action(
                `/sales-documents/${id}/replace`,
                { version: sale.version },
                "Create a new draft linked to this voided document?",
                true,
              )
            }
          >
            Create replacement draft
          </Button>
        )}
        {sale.status === "DRAFT" &&
          !sale.sourceQuotationId &&
          !sale.replacesId && (
            <Button
              variant="outline"
              onClick={async () => {
                if (!confirm("Delete this draft permanently?")) return;
                setBusy(true);
                try {
                  await api(`/sales-documents/${id}`, {
                    method: "DELETE",
                    body: JSON.stringify({ version: sale.version }),
                  });
                  router.push("/invoices");
                } catch (e) {
                  setError((e as Error).message);
                  setBusy(false);
                }
              }}
            >
              Delete draft
            </Button>
          )}
      </fieldset>
      {sale.type === "INVOICE" &&
        sale.status === "ISSUED" &&
        sale.balanceKobo > 0 && (
          <form
            className="card space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const [whole, decimals = ""] = payment.amount.split(".");
              const amountKobo =
                Number(whole) * 100 + Number(decimals.padEnd(2, "0"));
              void action(
                `/sales-documents/${id}/payments`,
                {
                  version: sale.version,
                  amountKobo,
                  date: payment.date,
                  method: payment.method,
                  reference: payment.reference,
                },
                `Record ${money(amountKobo)} as an owner-entered payment? This does not verify a bank transfer.`,
              );
            }}
          >
            <h2 className="font-semibold">Record payment</h2>
            <fieldset disabled={busy} className="grid gap-3 sm:grid-cols-2">
              <label>
                Amount (NGN)
                <input
                  required
                  pattern="[0-9]+(\.[0-9]{1,2})?"
                  inputMode="decimal"
                  className={inputClass}
                  value={payment.amount}
                  onChange={(e) =>
                    setPayment({ ...payment, amount: e.target.value })
                  }
                />
              </label>
              <label>
                Payment date
                <input
                  required
                  type="date"
                  max={today()}
                  className={inputClass}
                  value={payment.date}
                  onChange={(e) =>
                    setPayment({ ...payment, date: e.target.value })
                  }
                />
              </label>
              <label>
                Method
                <select
                  className={inputClass}
                  value={payment.method}
                  onChange={(e) =>
                    setPayment({ ...payment, method: e.target.value })
                  }
                >
                  {["BANK_TRANSFER", "CASH", "CARD", "OTHER"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label>
                Reference (optional)
                <input
                  maxLength={200}
                  className={inputClass}
                  value={payment.reference}
                  onChange={(e) =>
                    setPayment({ ...payment, reference: e.target.value })
                  }
                />
              </label>
              <Button type="submit">Record manual payment</Button>
            </fieldset>
          </form>
        )}
      {sale.payments.length > 0 && (
        <section className="card space-y-3">
          <h2 className="font-semibold">Owner-entered payment history</h2>
          <p className="text-sm">
            These records are not bank-verified. A reversal corrects the record;
            it does not send a refund.
          </p>
          {sale.payments.map((p) => (
            <div className="rounded border p-3" key={p.id}>
              <p>
                {money(p.amountKobo)} · {p.date} · {p.method}
              </p>
              <p>{p.reference}</p>
              {p.reversal ? (
                <p>Reversed: {p.reversal.reason}</p>
              ) : (
                <Button
                  disabled={busy}
                  variant="outline"
                  onClick={() => {
                    const explanation = prompt(
                      "Reason for reversing this payment record:",
                    );
                    if (explanation?.trim())
                      void action(
                        `/payments/${p.id}/reverse`,
                        { version: sale.version, reason: explanation },
                        `Reverse the ${money(p.amountKobo)} record? This increases the outstanding balance and does not transfer money.`,
                      );
                  }}
                >
                  Reverse record
                </Button>
              )}
            </div>
          ))}
        </section>
      )}
      {sale.status === "ISSUED" && (
        <section className="card space-y-3">
          <h2 className="font-semibold">Correct this document</h2>
          <p className="text-sm">
            Reverse any payment records before voiding. The original number and
            history remain.
          </p>
          <label className="block">
            Reason for voiding
            <textarea
              maxLength={500}
              className={inputClass}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <Button
            disabled={busy || sale.paidKobo > 0 || !reason.trim()}
            variant="outline"
            onClick={() =>
              void action(
                `/sales-documents/${id}/void`,
                { version: sale.version, reason },
                "Void this document permanently? Future PDFs will show VOID. You can create a linked replacement draft.",
              )
            }
          >
            Void document
          </Button>
        </section>
      )}
      <div className="flex flex-wrap gap-4">
        {sale.sourceQuotationId && (
          <Link
            className="underline"
            href={`/invoices/${sale.sourceQuotationId}`}
          >
            Source quotation
          </Link>
        )}
        {sale.convertedInvoice && (
          <Link
            className="underline"
            href={`/invoices/${sale.convertedInvoice.id}`}
          >
            Linked invoice
          </Link>
        )}
        {sale.replacesId && (
          <Link className="underline" href={`/invoices/${sale.replacesId}`}>
            Original voided document
          </Link>
        )}
        {sale.replacement && (
          <Link className="underline" href={`/invoices/${sale.replacement.id}`}>
            Replacement document
          </Link>
        )}
      </div>
    </div>
  );
}
