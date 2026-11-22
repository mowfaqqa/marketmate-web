"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package,
  Plus,
  Search,
  ArrowUpRight,
  Archive,
  BriefcaseBusiness,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { money, type ProductList } from "@/lib/catalogue";
import { Button } from "@/components/ui/button";
import { PrivateImage } from "@/components/private-image";
export function ProductListView() {
  const router = useRouter();
  const params = useSearchParams();
  const search = params.get("search") || "";
  const status = params.get("status") === "archived" ? "archived" : "active";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const [searchText, setSearchText] = useState(search);
  const [data, setData] = useState<ProductList>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const query = new URLSearchParams({
    search,
    status,
    page: String(page),
  }).toString();
  const returnTo = `/products?${query}`;
  useEffect(() => {
    setSearchText(search);
  }, [search]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    api<ProductList>(`/products?${query}`, { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError && err.status === 401)
          router.replace("/login");
        else
          setError(
            err instanceof Error
              ? err.message
              : "Your library could not be loaded.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query, retry, router]);
  function path(next: Record<string, string>) {
    return `/products?${new URLSearchParams({ search, status, page: String(page), ...next })}`;
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    router.push(path({ search: searchText.trim(), page: "1" }));
  }
  return (
    <>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product library</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Keep your products, services and confirmed details in one place.
          </p>
        </div>
        <Button asChild>
          <Link href={`/products/new?returnTo=${encodeURIComponent(returnTo)}`}>
            <Plus size={18} />
            Add product or service
          </Link>
        </Button>
      </div>
      <div className="mb-6 grid divide-y divide-border rounded-xl border border-border bg-white sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="flex items-center gap-4 p-4 sm:p-6">
          <span className="rounded-lg bg-green-50 p-3 text-primary">
            <Package size={22} />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">
              Active in your library
            </p>
            <p className="text-2xl font-semibold tabular-nums">
              {data?.activeCount ?? "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 sm:p-6">
          <span className="rounded-lg bg-slate-50 p-3 text-muted-foreground">
            <Archive size={22} />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">
              Archived for safekeeping
            </p>
            <p className="text-2xl font-semibold tabular-nums">
              {data?.archivedCount ?? "—"}
            </p>
          </div>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <nav aria-label="Product status" className="flex gap-2">
          {["active", "archived"].map((value) => (
            <Link
              key={value}
              href={path({ status: value, page: "1" })}
              aria-current={status === value ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-medium capitalize ${status === value ? "bg-primary text-white" : "border border-border bg-white text-muted-foreground"}`}
            >
              {value}
            </Link>
          ))}
        </nav>
        <form
          role="search"
          onSubmit={submit}
          className="flex w-full items-end gap-2 sm:w-auto"
        >
          <label className="field flex-1">
            Search by name
            <input
              type="search"
              maxLength={100}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Find a product or service"
            />
          </label>
          <Button variant="outline" aria-label="Search products">
            <Search size={18} />
          </Button>
        </form>
      </div>
      {error && (
        <div role="alert" className="card mb-6 border-red-200 text-red-800">
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => setRetry((value) => value + 1)}
          >
            Try again
          </Button>
        </div>
      )}
      {loading ? (
        <div role="status" className="card text-muted-foreground">
          Loading your library…
        </div>
      ) : !error && !data?.items.length ? (
        <section className="card py-16 text-center">
          <Package size={36} className="mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold">
            {search
              ? "No matching products yet."
              : status === "archived"
                ? "Nothing archived."
                : "Your next promotion starts here."}
          </h2>
          <p className="mx-auto my-3 max-w-md text-sm text-muted-foreground">
            {search
              ? "Try a different name or clear your search."
              : status === "archived"
                ? "Archived items stay here, ready to restore when you need them."
                : "Add a product or service with its real details. You can add a photo after saving."}
          </p>
          {status === "active" && !search && (
            <Button asChild className="mt-3">
              <Link
                href={`/products/new?returnTo=${encodeURIComponent(returnTo)}`}
              >
                <Plus size={17} />
                Add your first item
              </Link>
            </Button>
          )}
        </section>
      ) : (
        !error && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {data?.items.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div className="relative bg-slate-50">
                    {product.primaryAsset ? (
                      <PrivateImage
                        assetId={product.primaryAsset.id}
                        alt={product.name}
                        className="aspect-4/3 w-full object-contain p-4"
                      />
                    ) : (
                      <div className="flex aspect-4/3 flex-col items-center justify-center gap-3 text-primary">
                        {product.type === "SERVICE" ? (
                          <BriefcaseBusiness size={36} />
                        ) : (
                          <Package size={36} />
                        )}
                        <p className="text-xs text-muted-foreground">
                          {product.type === "SERVICE"
                            ? "Service · brand placeholder available"
                            : "Add a photo for promotional graphics"}
                        </p>
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-muted-foreground">
                      {product.type === "SERVICE" ? "Service" : "Product"}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {product.category || "Uncategorised"}
                        </p>
                        <h2 className="mt-1 wrap-break-word font-semibold">
                          {product.name}
                        </h2>
                      </div>
                      <Link
                        aria-label={`Edit ${product.name}`}
                        href={`/products/${product.id}?returnTo=${encodeURIComponent(returnTo)}`}
                        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border text-primary hover:bg-green-50"
                      >
                        <ArrowUpRight size={18} />
                      </Link>
                    </div>
                    <p className="text-lg font-semibold">
                      {product.priceKobo === null
                        ? "Price on request"
                        : money(product.priceKobo)}
                    </p>
                    <p className="mt-2 line-clamp-2 min-h-10 wrap-break-word text-sm text-muted-foreground">
                      {product.description ||
                        "Add a description to make your marketing more useful."}
                    </p>
                    {product.offer && (
                      <p
                        className={`mt-4 rounded-lg px-3 py-2 text-xs ${product.offer.state === "active" && !product.archivedAt ? "bg-green-50 text-primary" : "bg-slate-50 text-muted-foreground"}`}
                      >
                        {product.offer.state === "active" && !product.archivedAt
                          ? `Active offer · ${money(product.offer.promoPriceKobo)}`
                          : `Offer ${product.offer.state}${product.archivedAt ? " · item archived" : ""}`}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {data?.total} {data?.total === 1 ? "item" : "items"} · Page{" "}
                {page} of {Math.max(1, Math.ceil((data?.total || 0) / 20))}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => router.push(path({ page: String(page - 1) }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page * 20 >= (data?.total || 0)}
                  onClick={() => router.push(path({ page: String(page + 1) }))}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )
      )}
    </>
  );
}
