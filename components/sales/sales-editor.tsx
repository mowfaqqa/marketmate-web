"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import {
  Customer,
  Sale,
  SaleInput,
  Line,
  blankLine,
  inputClass,
  today,
} from "@/lib/sales";
import { Button } from "@/components/ui/button";

function Amount({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [text, setText] = useState((value / 100).toFixed(2));
  useEffect(() => {
    setText((value / 100).toFixed(2));
  }, [value]);
  return (
    <label className="grid gap-1">
      {label}
      <input
        className={inputClass}
        inputMode="decimal"
        required
        pattern="[0-9]+(\.[0-9]{1,2})?"
        value={text}
        onChange={(e) => {
          const next = e.target.value;
          setText(next);
          if (/^\d+(\.\d{0,2})?$/.test(next)) {
            const [whole, decimal = ""] = next.split(".");
            onChange(Number(whole) * 100 + Number(decimal.padEnd(2, "0")));
          }
        }}
      />
    </label>
  );
}
export function SalesEditor({
  sale,
  onSaved,
}: {
  sale?: Sale;
  onSaved?: (sale: Sale) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<SaleInput>(() =>
    sale
      ? {
          type: sale.type,
          customerId: sale.customerId,
          dueDate: sale.dueDate,
          lines: sale.lines.map(
            ({
              productId,
              description,
              quantity,
              unitPriceKobo,
              discountKobo,
              taxRate,
            }) => ({
              ...(productId ? { productId } : {}),
              description,
              quantity,
              unitPriceKobo,
              discountKobo,
              taxRate,
            }),
          ),
          deliveryKobo: sale.totals.deliveryKobo,
          notes: sale.notes,
          paymentInstructions: sale.paymentInstructions,
        }
      : {
          type: "INVOICE",
          customerId: "",
          dueDate: today(),
          lines: [blankLine()],
          deliveryKobo: 0,
          notes: "",
          paymentInstructions: "",
        },
  );
  const [customers, setCustomers] = useState<Customer[]>(
    sale ? [{ ...sale.buyer, id: sale.customerId }] : [],
  );
  const [customerSearch, setCustomerSearch] = useState("");
  const [products, setProducts] = useState<
    { id: string; name: string; priceKobo: number | null }[]
  >([]);
  const [productSearch, setProductSearch] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer>();
  const [newCustomer, setNewCustomer] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [savedAt, setSavedAt] = useState("");
  const [dirty, setDirty] = useState(false);
  const request = useRef<{ fingerprint: string; key: string } | null>(null);
  const customerRequest = useRef<{ fingerprint: string; key: string } | null>(
    null,
  );
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      api<{ items: Customer[] }>(
        `/customers?search=${encodeURIComponent(customerSearch)}`,
      )
        .then((result) => {
          if (active) setCustomers(result.items);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [customerSearch]);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      api<{ items: typeof products }>(
        `/products?search=${encodeURIComponent(productSearch)}`,
      )
        .then((result) => {
          if (active) setProducts(result.items);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [productSearch]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function update(patch: Partial<SaleInput>) {
    setDirty(true);
    setForm((prev) => ({ ...prev, ...patch }));
  }
  function line(index: number, patch: Partial<Line>) {
    update({
      lines: form.lines.map((value, i) =>
        i === index ? { ...value, ...patch } : value,
      ),
    });
  }
  function stableKey(ref: typeof request, payload: unknown) {
    const fingerprint = JSON.stringify(payload);
    if (ref.current?.fingerprint !== fingerprint)
      ref.current = { fingerprint, key: crypto.randomUUID() };
    return ref.current.key;
  }
  async function addCustomer() {
    setBusy(true);
    setError("");
    try {
      const result = await api<Customer>(
        editingCustomer ? `/customers/${editingCustomer.id}` : "/customers",
        {
          method: editingCustomer ? "PATCH" : "POST",
          headers: editingCustomer
            ? {}
            : { "Idempotency-Key": stableKey(customerRequest, customer) },
          body: JSON.stringify({
            ...customer,
            ...(editingCustomer ? { version: editingCustomer.version } : {}),
          }),
        },
      );
      setCustomers((prev) => [
        result,
        ...prev.filter((c) => c.id !== result.id),
      ]);
      update({ customerId: result.id });
      setNewCustomer(false);
      setEditingCustomer(undefined);
      setCustomer({ name: "", phone: "", email: "", address: "" });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setConflict(false);
    try {
      const result = await api<Sale>(
        sale ? `/sales-documents/${sale.id}` : "/sales-documents",
        {
          method: sale ? "PATCH" : "POST",
          headers: sale ? {} : { "Idempotency-Key": stableKey(request, form) },
          body: JSON.stringify({
            ...form,
            ...(sale ? { version: sale.version } : {}),
          }),
        },
      );
      setDirty(false);
      setSavedAt(new Date().toLocaleTimeString());
      if (onSaved) onSaved(result);
      else router.push(`/invoices/${result.id}`);
    } catch (e) {
      setError((e as Error).message);
      setConflict(e instanceof ApiError && e.status === 409);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="space-y-5" onSubmit={save}>
      <h1 className="text-2xl font-bold">
        {sale ? "Edit draft" : "Create a sales document"}
      </h1>
      <p className="text-muted-foreground">
        Save a draft to review calculated totals before issuing. Amounts are in
        NGN.
      </p>
      <fieldset disabled={busy} className="space-y-5">
        <section className="card grid gap-4 sm:grid-cols-2">
          <label>
            Document type
            <select
              className={inputClass}
              disabled={!!sale}
              value={form.type}
              onChange={(e) =>
                update({ type: e.target.value as SaleInput["type"] })
              }
            >
              <option value="INVOICE">Invoice</option>
              <option value="QUOTATION">Quotation</option>
            </select>
          </label>
          <label>
            {form.type === "QUOTATION" ? "Valid until" : "Due date"}
            <input
              required
              className={inputClass}
              type="date"
              value={form.dueDate}
              onChange={(e) => update({ dueDate: e.target.value })}
            />
          </label>
          <label>
            Find a customer
            <input
              className={inputClass}
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
          </label>
          <label>
            Customer
            <select
              required
              className={inputClass}
              value={form.customerId}
              onChange={(e) => update({ customerId: e.target.value })}
            >
              <option value="">Select customer</option>
              {sale && !customers.some((c) => c.id === sale.customerId) && (
                <option value={sale.customerId}>
                  {sale.buyer.name} (saved)
                </option>
              )}
              {customers.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setNewCustomer(!newCustomer);
              setEditingCustomer(undefined);
              setCustomer({ name: "", phone: "", email: "", address: "" });
            }}
          >
            {newCustomer ? "Cancel new customer" : "Add customer here"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!form.customerId}
            onClick={async () => {
              try {
                const current = await api<Customer>(
                  `/customers/${form.customerId}`,
                );
                setEditingCustomer(current);
                setCustomer({
                  name: current.name,
                  phone: current.phone,
                  email: current.email,
                  address: current.address,
                });
                setNewCustomer(true);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            Edit selected customer
          </Button>
        </section>
        {newCustomer && (
          <section className="card space-y-3">
            <h2 className="font-semibold">
              {editingCustomer ? "Edit customer" : "New customer"}
            </h2>
            {(["name", "phone", "email", "address"] as const).map((field) => (
              <label className="grid gap-1 capitalize" key={field}>
                {field}
                {field === "name" ? " (required)" : " (optional)"}
                <input
                  maxLength={
                    field === "address"
                      ? 500
                      : field === "phone"
                        ? 40
                        : field === "email"
                          ? 254
                          : 120
                  }
                  className={inputClass}
                  value={customer[field]}
                  onChange={(e) =>
                    setCustomer({ ...customer, [field]: e.target.value })
                  }
                />
              </label>
            ))}
            <Button
              type="button"
              disabled={!customer.name.trim()}
              onClick={() => void addCustomer()}
            >
              Save customer
            </Button>
          </section>
        )}
        <section className="card space-y-4">
          <h2 className="font-semibold">Items</h2>
          <label className="block">
            Find a saved product
            <input
              className={inputClass}
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
          </label>
          {form.lines.map((item, index) => (
            <fieldset
              className="rounded-xl border border-border p-4"
              key={index}
            >
              <legend className="px-2 font-semibold">Item {index + 1}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  Use a product (optional)
                  <select
                    className={inputClass}
                    value={item.productId ?? ""}
                    onChange={(e) => {
                      const product = products.find(
                        (p) => p.id === e.target.value,
                      );
                      line(
                        index,
                        product
                          ? {
                              productId: product.id,
                              description: product.name,
                              unitPriceKobo: product.priceKobo ?? 0,
                            }
                          : { productId: undefined },
                      );
                    }}
                  >
                    <option value="">Custom item</option>
                    {item.productId &&
                      !products.some((p) => p.id === item.productId) && (
                        <option value={item.productId}>
                          Saved product reference
                        </option>
                      )}
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                        {p.priceKobo === null ? " — enter agreed price" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Description
                  <input
                    required
                    maxLength={500}
                    className={inputClass}
                    value={item.description}
                    onChange={(e) =>
                      line(index, { description: e.target.value })
                    }
                  />
                </label>
                <label>
                  Quantity
                  <input
                    required
                    className={inputClass}
                    inputMode="decimal"
                    pattern="[0-9]+(\.[0-9]{1,3})?"
                    value={item.quantity}
                    onChange={(e) => line(index, { quantity: e.target.value })}
                  />
                </label>
                <Amount
                  label="Unit price (NGN)"
                  value={item.unitPriceKobo}
                  onChange={(v) => line(index, { unitPriceKobo: v })}
                />
                <Amount
                  label="Line discount (NGN)"
                  value={item.discountKobo}
                  onChange={(v) => line(index, { discountKobo: v })}
                />
                <label>
                  Tax rate (decimal; 0 means no tax)
                  <input
                    required
                    className={inputClass}
                    inputMode="decimal"
                    pattern="(0|1)(\.[0-9]{1,4})?"
                    value={item.taxRate}
                    onChange={(e) => line(index, { taxRate: e.target.value })}
                  />
                </label>
              </div>
              <Button
                type="button"
                className="mt-3"
                variant="outline"
                disabled={form.lines.length === 1}
                onClick={() =>
                  update({ lines: form.lines.filter((_, i) => i !== index) })
                }
              >
                Remove item {index + 1}
              </Button>
            </fieldset>
          ))}
          <Button
            type="button"
            variant="outline"
            disabled={form.lines.length >= 50}
            onClick={() => update({ lines: [...form.lines, blankLine()] })}
          >
            Add item
          </Button>
          <p className="text-sm text-muted-foreground">
            Tax rates are chosen by you. MarketMate does not infer your tax
            obligations.
          </p>
        </section>
        <section className="card grid gap-4">
          <Amount
            label="Delivery charge (NGN, non-taxed)"
            value={form.deliveryKobo}
            onChange={(v) => update({ deliveryKobo: v })}
          />
          <label>
            Notes and terms
            <textarea
              maxLength={2000}
              className={inputClass}
              value={form.notes}
              onChange={(e) => update({ notes: e.target.value })}
            />
          </label>
          <label>
            Payment instructions
            <textarea
              maxLength={2000}
              className={inputClass}
              value={form.paymentInstructions}
              onChange={(e) => update({ paymentInstructions: e.target.value })}
            />
          </label>
        </section>
      </fieldset>
      {error && (
        <div role="alert" className="rounded border border-red-200 p-3">
          {error}
          {conflict && (
            <p>
              Your edits are still here. Copy them before reloading the saved
              document.{" "}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (confirm("Discard these unsaved edits and reload?"))
                    window.location.reload();
                }}
              >
                Reload saved document
              </Button>
            </p>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={busy || newCustomer} type="submit">
          {busy ? "Saving…" : "Save draft and review"}
        </Button>
        <p role="status" className="text-sm">
          {dirty
            ? "Unsaved changes"
            : savedAt
              ? `Saved at ${savedAt}`
              : "Save explicitly to keep your changes."}
        </p>
      </div>
    </form>
  );
}
