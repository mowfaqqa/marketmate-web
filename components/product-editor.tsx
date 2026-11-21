"use client";
import { useAutosave } from "@/hooks/use-autosave";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Archive,
  RotateCcw,
  Upload,
  ImagePlus,
  Package,
  Tag,
  Check,
  Copy,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import {
  dateTime,
  lagosInput,
  lagosInstant,
  libraryPath,
  money,
  moneyInput,
  parseMoney,
  type Product,
} from "@/lib/catalogue";
import { Button } from "@/components/ui/button";
import { PrivateImage } from "@/components/private-image";

type Form = {
  clientId: string;
  type: "PRODUCT" | "SERVICE";
  name: string;
  category: string;
  description: string;
  pricingMode: "FIXED" | "INQUIRY";
  price: string;
  materialSize: string;
  serviceArea: string;
  fulfilmentTerms: string;
  confirmedClaims: string;
};
function formFrom(product: Product): Form {
  return {
    clientId: product.id,
    type: product.type,
    name: product.name,
    category: product.category,
    description: product.description,
    pricingMode: product.pricingMode,
    price: moneyInput(product.priceKobo),
    materialSize: product.materialSize,
    serviceArea: product.serviceArea,
    fulfilmentTerms: product.fulfilmentTerms,
    confirmedClaims: product.confirmedClaims,
  };
}
function blankForm(): Form {
  return {
    clientId: crypto.randomUUID(),
    type: "PRODUCT",
    name: "",
    category: "",
    description: "",
    pricingMode: "FIXED",
    price: "",
    materialSize: "",
    serviceArea: "",
    fulfilmentTerms: "",
    confirmedClaims: "",
  };
}
export function ProductEditor({ id }: { id: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = libraryPath(params.get("returnTo"));
  const [form, setForm] = useState<Form>(blankForm);
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState(id !== "new");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [dirty, setDirty] = useState(false);
  const [offerDirty, setOfferDirty] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [file, setFile] = useState<File>();
  const [localPreview, setLocalPreview] = useState("");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [priorPrice, setPriorPrice] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [terms, setTerms] = useState("");
  const productFormRef = useRef<HTMLFormElement>(null);
  const online = useAutosave({ dirty, revision: JSON.stringify(form), blocked: !product || !!busy || conflict || offerDirty || !!file || !!error, save: () => { if (productFormRef.current?.checkValidity()) productFormRef.current.requestSubmit(); }, reconnect: () => { if (!conflict) setError(""); } });
  const errorRef = useRef<HTMLDivElement>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api<Product>(`/products/${id}`);
      setProduct(result);
      setForm(formFrom(result));
      setDirty(false);
      setOfferDirty(false);
      setConflict(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401)
        router.replace("/login");
      else
        setError(
          err instanceof Error ? err.message : "Unable to load this product.",
        );
    } finally {
      setLoading(false);
    }
  }, [id, router]);
  useEffect(() => {
    if (id !== "new") void load();
    else
      api("/auth/me").catch((err) => {
        if (err instanceof ApiError && err.status === 401)
          router.replace("/login");
      });
  }, [id, load, router]);
  useEffect(() => {
    const offer = product?.offer;
    setOfferPrice(offer ? moneyInput(offer.promoPriceKobo) : "");
    setPriorPrice(offer ? moneyInput(offer.assertedPriorPriceKobo) : "");
    setStartsAt(lagosInput(offer?.startsAt || new Date().toISOString()));
    setEndsAt(
      lagosInput(
        offer?.endsAt || new Date(Date.now() + 86400000).toISOString(),
      ),
    );
    setTerms(offer?.terms || "");
    setOfferDirty(false);
  }, [product?.offer]);
  useEffect(() => {
    if (!file) {
      setLocalPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      if (dirty || offerDirty || file) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, offerDirty, file]);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  function edit(key: keyof Form, value: string) {
    if (!conflict) setError("");
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setNotice("");
  }
  function failure(err: unknown) {
    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong. Your current text is still here.",
    );
    if (err instanceof ApiError && err.status === 409) setConflict(true);
    if (err instanceof ApiError && err.status === 401)
      setError(
        "Your session expired. Open sign-in in another tab, then return here and retry.",
      );
  }
  function leave(event: React.MouseEvent<HTMLAnchorElement>) {
    if (
      (dirty || offerDirty || file) &&
      !confirm("Leave without saving your current changes?")
    )
      event.preventDefault();
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (
      offerDirty &&
      !confirm("Save product details and discard your unsaved offer edits?")
    )
      return;
    setBusy("save");
    setError("");
    setNotice("");
    try {
      const { price, ...fields } = form;
      const payload = {
        ...fields,
        name: fields.name.trim(),
        priceKobo: form.pricingMode === "FIXED" ? parseMoney(price) : null,
        ...(product ? { version: product.version } : {}),
      };
      const saved = await api<Product>(
        product ? `/products/${product.id}` : "/products",
        { method: product ? "PUT" : "POST", body: JSON.stringify(payload) },
      );
      setProduct(saved);
      setForm(formFrom(saved));
      setDirty(false);
      setNotice("Product details saved.");
      if (id === "new")
        router.replace(
          `/products/${saved.id}?returnTo=${encodeURIComponent(returnTo)}`,
        );
    } catch (err) {
      failure(err);
    } finally {
      setBusy("");
    }
  }
  async function upload() {
    if (!file || !product || !rightsConfirmed) return;
    setBusy("photo");
    setError("");
    setNotice("");
    try {
      const ticket = await api<{ id: string; uploadToken: string }>(
        `/products/${product.id}/image-upload`,
        {
          method: "POST",
          body: JSON.stringify({ version: product.version, rightsConfirmed }),
        },
      );
      const data = new FormData();
      data.append("file", file);
      const result = await api<Product>(`/assets/${ticket.id}/complete`, {
        method: "POST",
        headers: { "x-upload-token": ticket.uploadToken },
        body: data,
      });
      setProduct(result);
      setFile(undefined);
      setRightsConfirmed(false);
      setNotice("Photo checked, prepared and saved.");
    } catch (err) {
      failure(err);
    } finally {
      setBusy("");
    }
  }
  async function archive() {
    if (!product) return;
    const archived = !product.archivedAt;
    const prompt = archived
      ? "Archive this item? It cannot be used in new promotions. Saved drafts and planner items will need review; historical sales documents stay unchanged."
      : "Restore this item to your active library?";
    if (!confirm(prompt)) return;
    setBusy("archive");
    setError("");
    setNotice("");
    try {
      const result = await api<Product>(`/products/${product.id}/archive`, {
        method: "PATCH",
        body: JSON.stringify({ version: product.version, archived }),
      });
      setProduct(result);
      setNotice(
        archived
          ? "Item archived. You can restore it anytime."
          : "Item restored to your library.",
      );
    } catch (err) {
      failure(err);
    } finally {
      setBusy("");
    }
  }
  async function saveOffer(event: FormEvent) {
    event.preventDefault();
    if (!product) return;
    if (
      !confirm(
        "Save this offer? It replaces any current offer for this product. Confirm the prices, dates and terms are accurate.",
      )
    )
      return;
    setBusy("offer");
    setError("");
    setNotice("");
    try {
      const result = await api<Product>(`/products/${product.id}/offer`, {
        method: "PUT",
        body: JSON.stringify({
          version: product.version,
          promoPriceKobo: parseMoney(offerPrice),
          assertedPriorPriceKobo: priorPrice.trim()
            ? parseMoney(priorPrice)
            : null,
          startsAt: lagosInstant(startsAt),
          endsAt: lagosInstant(endsAt),
          terms,
        }),
      });
      setProduct(result);
      setOfferDirty(false);
      setNotice(
        "Offer saved. Its timing is checked before it can be promoted.",
      );
    } catch (err) {
      failure(err);
    } finally {
      setBusy("");
    }
  }
  async function cancelOffer() {
    if (
      !product ||
      !confirm(
        "Cancel this offer? Future exports will need to use the current product facts.",
      )
    )
      return;
    setBusy("cancel");
    setError("");
    try {
      setProduct(
        await api<Product>(`/products/${product.id}/offer/cancel`, {
          method: "POST",
          body: JSON.stringify({ version: product.version }),
        }),
      );
      setOfferDirty(false);
      setNotice("Offer cancelled.");
    } catch (err) {
      failure(err);
    } finally {
      setBusy("");
    }
  }
  async function copyEdits() {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(
          { ...form, offerPrice, priorPrice, startsAt, endsAt, terms },
          null,
          2,
        ),
      );
      setNotice(
        "Your current text was copied. Reload the saved version when you are ready.",
      );
    } catch {
      setError("Copy failed. Keep this tab open and copy your text manually.");
    }
  }
  if (loading) return <p role="status">Loading your product…</p>;
  return (
    <>
      <Link
        href={returnTo}
        onClick={leave}
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-primary"
      >
        <ArrowLeft size={16} />
        Back to library
      </Link>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-primary">
            {product?.archivedAt
              ? "Archived item"
              : product
                ? "Your saved product"
                : "Build your library"}
          </p>
          <h1 className="wrap-break-word text-3xl font-semibold">
            {product ? product.name : "Add something worth sharing."}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Real details make better promotions. Save only facts you can
            confirm.
          </p>
        </div>
        {product && (
          <Button
            variant="outline"
            disabled={!!busy || dirty || offerDirty || !!file || conflict}
            onClick={() => void archive()}
          >
            {product.archivedAt ? (
              <RotateCcw size={17} />
            ) : (
              <Archive size={17} />
            )}{" "}
            {product.archivedAt ? "Restore item" : "Archive item"}
          </Button>
        )}
      </div>
      {error && (
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <p>{error}</p>
          {conflict && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => void copyEdits()}>
                <Copy size={16} />
                Copy my edits
              </Button>
              {id === "new" ? (
                <Button asChild variant="outline">
                  <Link
                    href={`/products/${form.clientId}?returnTo=${encodeURIComponent(returnTo)}`}
                  >
                    Open saved product
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (
                      confirm(
                        "Replace your form with the latest saved product? Copy your changes first if needed.",
                      )
                    )
                      void load();
                  }}
                >
                  Reload saved product
                </Button>
              )}
            </div>
          )}
          {!product && id !== "new" && !conflict && (
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => void load()}
            >
              Try again
            </Button>
          )}
          {error.includes("session expired") && (
            <Link
              className="mt-3 block underline"
              href="/login"
              target="_blank"
              rel="noopener"
            >
              Open sign-in in another tab
            </Link>
          )}
        </div>
      )}
      {notice && (
        <p
          role="status"
          className="mb-6 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-primary"
        >
          <Check size={18} />
          {notice}
        </p>
      )}
      {(id === "new" || product) && (
        <div className="grid items-start gap-6 xl:grid-cols-[1.4fr_1fr]">
          <form ref={productFormRef} onSubmit={save} className="card">
            <fieldset
              disabled={!!busy || !!product?.archivedAt || conflict}
              className="space-y-5"
            >
              <legend className="mb-5 text-lg font-semibold">
                Product details
              </legend>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="field">
                  Item type
                  <select
                    value={form.type}
                    onChange={(e) => edit("type", e.target.value)}
                  >
                    <option value="PRODUCT">Physical product</option>
                    <option value="SERVICE">Service</option>
                  </select>
                </label>
                <label className="field">
                  Category
                  <input
                    maxLength={80}
                    value={form.category}
                    onChange={(e) => edit("category", e.target.value)}
                    placeholder="For example, accessories"
                  />
                </label>
              </div>
              <label className="field">
                Name <span className="sr-only">required</span>
                <input
                  required
                  minLength={1}
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => edit("name", e.target.value)}
                  placeholder="The name your customers know"
                />
              </label>
              <label className="field">
                Confirmed description
                <textarea
                  maxLength={2000}
                  rows={4}
                  value={form.description}
                  onChange={(e) => edit("description", e.target.value)}
                  placeholder="Describe what you offer. Avoid promises you cannot confirm."
                />
                <span className="text-xs font-normal text-muted-foreground">
                  {form.description.length}/2,000 characters
                </span>
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="field">
                  Pricing
                  <select
                    value={form.pricingMode}
                    onChange={(e) => edit("pricingMode", e.target.value)}
                  >
                    <option value="FIXED">Fixed price</option>
                    <option value="INQUIRY">Price on request</option>
                  </select>
                </label>
                {form.pricingMode === "FIXED" && (
                  <label className="field">
                    Price in NGN
                    <input
                      required
                      inputMode="decimal"
                      maxLength={14}
                      value={form.price}
                      onChange={(e) => edit("price", e.target.value)}
                      placeholder="0.00"
                    />
                    <span className="text-xs font-normal text-muted-foreground">
                      Up to two decimal places.
                    </span>
                  </label>
                )}
              </div>
              <details className="rounded-lg border border-border p-4">
                <summary className="cursor-pointer text-sm font-medium">
                  More confirmed facts{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </summary>
                <div className="mt-5 space-y-5">
                  <label className="field">
                    Material, size or specifications
                    <input
                      maxLength={500}
                      value={form.materialSize}
                      onChange={(e) => edit("materialSize", e.target.value)}
                    />
                  </label>
                  <label className="field">
                    Service area
                    <input
                      maxLength={500}
                      value={form.serviceArea}
                      onChange={(e) => edit("serviceArea", e.target.value)}
                    />
                  </label>
                  <label className="field">
                    Fulfilment or delivery terms
                    <textarea
                      maxLength={500}
                      rows={2}
                      value={form.fulfilmentTerms}
                      onChange={(e) => edit("fulfilmentTerms", e.target.value)}
                    />
                  </label>
                  <label className="field">
                    Owner-confirmed claims
                    <textarea
                      maxLength={1000}
                      rows={3}
                      value={form.confirmedClaims}
                      onChange={(e) => edit("confirmedClaims", e.target.value)}
                    />
                    <span className="text-xs font-normal text-muted-foreground">
                      Only facts you can substantiate. Saving a claim does not
                      approve it for AI use.
                    </span>
                  </label>
                </div>
              </details>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
                <p role="status" className="text-xs text-muted-foreground">
                  {busy === "save"
                    ? "Saving…"
                    : dirty
                      ? (online ? "Unsaved changes · autosave pending" : "Offline · changes remain in this tab")
                      : product
                        ? `Saved ${dateTime(product.updatedAt)}`
                        : "Save details to add a photo or offer."}
                </p>
                <Button disabled={!!product && !dirty}>
                  {busy === "save" ? "Saving…" : "Save product details"}
                </Button>
              </div>
            </fieldset>
          </form>
          <div className="space-y-6">
            <section className="card">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <ImagePlus size={20} />
                Product photo
              </h2>
              {localPreview ? (
                <img
                  src={localPreview}
                  alt="Selected photo preview, not yet uploaded"
                  className="mb-4 aspect-square max-h-72 w-full rounded-lg bg-slate-50 object-contain"
                />
              ) : product?.primaryAsset ? (
                <PrivateImage
                  key={product.primaryAsset.id}
                  assetId={product.primaryAsset.id}
                  alt={product.name}
                  className="mb-4 aspect-square max-h-72 w-full rounded-lg bg-slate-50 object-contain"
                />
              ) : (
                <div className="mb-4 flex aspect-4/3 items-center justify-center rounded-lg bg-slate-50 text-primary">
                  <Package size={40} />
                </div>
              )}
              <p className="mb-4 text-sm text-muted-foreground">
                {form.type === "SERVICE"
                  ? "A service can use your brand as a placeholder. A real photo is optional."
                  : "A real uploaded photo is required before a physical product can appear in a promotional graphic."}
              </p>
              {!product ? (
                <p className="rounded-lg bg-green-50 p-3 text-sm text-primary">
                  Save the product details first, then add its photo here.
                </p>
              ) : (
                <fieldset
                  disabled={!!busy || !!product.archivedAt || conflict}
                  className="space-y-4"
                >
                  <label className="field">
                    Choose a photo
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const selected = e.target.files?.[0];
                        if (selected && selected.size > 10 * 1024 * 1024) {
                          setError(
                            "Choose a photo up to 10 MB. Your saved product details are safe.",
                          );
                          e.target.value = "";
                          return;
                        }
                        setFile(selected);
                        setRightsConfirmed(false);
                        setNotice("");
                      }}
                    />
                    <span className="text-xs font-normal text-muted-foreground">
                      JPEG, PNG or WebP · 10 MB · up to 20 megapixels. Photos
                      are checked and metadata is removed.
                    </span>
                  </label>
                  {file && (
                    <>
                      <label className="flex min-h-11 items-start gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={rightsConfirmed}
                          onChange={(e) => setRightsConfirmed(e.target.checked)}
                          className="mt-1 h-5 w-5 shrink-0"
                        />
                        I have permission to use this image and any trademarks
                        it contains.
                      </label>
                      {(dirty || offerDirty) && (
                        <p className="text-xs text-amber-800">
                          Save your product and offer edits before uploading the
                          photo.
                        </p>
                      )}
                      <Button
                        type="button"
                        disabled={!rightsConfirmed || dirty || offerDirty}
                        onClick={() => void upload()}
                      >
                        <Upload size={17} />
                        {busy === "photo"
                          ? "Checking and saving photo…"
                          : "Upload photo"}
                      </Button>
                      <button
                        type="button"
                        className="ml-3 min-h-11 text-sm text-muted-foreground underline"
                        onClick={() => setFile(undefined)}
                      >
                        Cancel selection
                      </button>
                    </>
                  )}
                </fieldset>
              )}
            </section>
            <section className="rounded-xl border border-green-200 bg-green-50 p-5">
              <h2 className="font-semibold text-primary">
                A reusable starting point
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your saved description, facts, price and photo will guide new
                promotions. Product changes never rewrite issued sales
                documents.
              </p>
            </section>
          </div>
          <section className="card xl:col-span-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Tag size={20} />
              Single-product offer
            </h2>
            <p className="mb-5 mt-2 text-sm text-muted-foreground">
              One current offer per product. You confirm the price and the
              dates; MarketMate checks when it can be used.
            </p>
            {product?.offer && (
              <div className="mb-5 rounded-lg bg-slate-50 p-4">
                <p className="font-medium capitalize">
                  {product.offer.state} · {money(product.offer.promoPriceKobo)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {dateTime(product.offer.startsAt)} →{" "}
                  {dateTime(product.offer.endsAt)} · Lagos time
                </p>
                {product.offer.discountBasisPoints !== null && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {product.offer.discountBasisPoints / 100}% below the current
                    fixed price, calculated by MarketMate.
                  </p>
                )}
                {product.offer.assertedPriorPriceKobo !== null && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Prior price {money(product.offer.assertedPriorPriceKobo)} is
                    your assertion, not verified price history.
                  </p>
                )}
              </div>
            )}
            {!product ? (
              <p className="text-sm text-muted-foreground">
                Save the product first to add an offer.
              </p>
            ) : product.archivedAt ? (
              <p className="text-sm text-muted-foreground">
                Restore this item before changing its offer.
              </p>
            ) : product.pricingMode === "INQUIRY" ? (
              <p className="text-sm text-muted-foreground">
                Price-on-request items cannot have a discount offer. Save a
                fixed price first.
              </p>
            ) : (
              <form onSubmit={saveOffer}>
                <fieldset
                  disabled={!!busy || conflict}
                  className="space-y-5"
                  onChange={() => {
                    setOfferDirty(true);
                    setNotice("");
                  }}
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="field">
                      Offer price in NGN
                      <input
                        required
                        inputMode="decimal"
                        maxLength={14}
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                      />
                      <span className="text-xs font-normal text-muted-foreground">
                        Must be below {money(product.priceKobo!)}.
                      </span>
                    </label>
                    <label className="field">
                      Asserted prior price in NGN (optional)
                      <input
                        inputMode="decimal"
                        maxLength={14}
                        value={priorPrice}
                        onChange={(e) => setPriorPrice(e.target.value)}
                      />
                      <span className="text-xs font-normal text-muted-foreground">
                        Only enter a price you can substantiate.
                      </span>
                    </label>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="field">
                      Starts at (Lagos time)
                      <input
                        required
                        type="datetime-local"
                        value={startsAt}
                        onChange={(e) => setStartsAt(e.target.value)}
                      />
                    </label>
                    <label className="field">
                      Ends at (Lagos time)
                      <input
                        required
                        type="datetime-local"
                        value={endsAt}
                        onChange={(e) => setEndsAt(e.target.value)}
                      />
                    </label>
                  </div>
                  <label className="field">
                    Offer terms (optional)
                    <textarea
                      rows={2}
                      maxLength={500}
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                    />
                  </label>
                  {dirty && (
                    <p className="text-sm text-amber-800">
                      Save your product edits before changing its offer.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Button disabled={dirty || !offerDirty}>
                      {busy === "offer"
                        ? "Saving offer…"
                        : product.offer
                          ? "Replace offer"
                          : "Save offer"}
                    </Button>
                    {product.offer &&
                      ["active", "scheduled"].includes(product.offer.state) && (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={dirty}
                          onClick={() => void cancelOffer()}
                        >
                          {busy === "cancel" ? "Cancelling…" : "Cancel offer"}
                        </Button>
                      )}
                  </div>
                </fieldset>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
