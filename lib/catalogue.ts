export const MAX_KOBO = 1_000_000_000_000;
export type Offer = {
  id: string;
  promoPriceKobo: number;
  assertedPriorPriceKobo: number | null;
  startsAt: string;
  endsAt: string;
  terms: string;
  state: "active" | "scheduled" | "expired" | "cancelled";
  discountBasisPoints: number | null;
};
export type Product = {
  id: string;
  type: "PRODUCT" | "SERVICE";
  name: string;
  category: string;
  description: string;
  pricingMode: "FIXED" | "INQUIRY";
  priceKobo: number | null;
  currency: "NGN";
  materialSize: string;
  serviceArea: string;
  fulfilmentTerms: string;
  confirmedClaims: string;
  primaryAsset: {
    id: string;
    width: number;
    height: number;
    status: string;
  } | null;
  archivedAt: string | null;
  version: number;
  updatedAt: string;
  graphicsReady: boolean;
  offer: Offer | null;
};
export type ProductList = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  activeCount: number;
  archivedCount: number;
};
export function money(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(kobo / 100);
}
export function parseMoney(value: string): number {
  if (!/^\d{1,11}(\.\d{1,2})?$/.test(value.trim()))
    throw new Error("Enter a positive price with at most two decimal places.");
  const [whole, fraction = ""] = value.trim().split(".");
  const kobo = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (kobo < 1 || kobo > MAX_KOBO)
    throw new Error("The price must be between ₦0.01 and ₦10,000,000,000.");
  return kobo;
}
export function moneyInput(kobo: number | null) {
  return kobo === null ? "" : (kobo / 100).toFixed(2);
}
export function lagosInput(date: string) {
  return new Date(new Date(date).getTime() + 3600000)
    .toISOString()
    .slice(0, 16);
}
export function lagosInstant(value: string) {
  return new Date(`${value}:00+01:00`).toISOString();
}
export function dateTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
export function libraryPath(value: string | null) {
  return value === "/products" || value?.startsWith("/products?")
    ? value
    : "/products";
}
