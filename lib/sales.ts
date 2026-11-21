export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  version: number;
};
export type Line = {
  productId?: string;
  description: string;
  quantity: string;
  unitPriceKobo: number;
  discountKobo: number;
  taxRate: string;
  grossKobo?: number;
  netKobo?: number;
  taxKobo?: number;
  totalKobo?: number;
};
export type SaleInput = {
  type: "INVOICE" | "QUOTATION";
  customerId: string;
  dueDate: string;
  lines: Line[];
  deliveryKobo: number;
  notes: string;
  paymentInstructions: string;
};
export type Sale = SaleInput & {
  id: string;
  number: string | null;
  status: "DRAFT" | "ISSUED" | "VOID";
  version: number;
  seller: { name: string; location: string; contact: string };
  buyer: Customer;
  totals: {
    subtotalKobo: number;
    discountKobo: number;
    deliveryKobo: number;
    taxKobo: number;
    totalKobo: number;
    taxByRate: Record<string, number>;
  };
  totalKobo: number;
  paidKobo: number;
  balanceKobo: number;
  paymentState: string | null;
  overdue: boolean;
  issueDate: string | null;
  pdfStatus: string;
  pdfError: string | null;
  voidReason: string | null;
  sourceQuotationId: string | null;
  replacesId: string | null;
  convertedInvoice: { id: string } | null;
  replacement: { id: string } | null;
  payments: {
    id: string;
    amountKobo: number;
    date: string;
    method: string;
    reference: string;
    reversal: { reason: string } | null;
  }[];
};
export const money = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    kobo / 100,
  );
export const today = () =>
  new Date(Date.now() + 3600000).toISOString().slice(0, 10);
export const blankLine = (): Line => ({
  description: "",
  quantity: "1",
  unitPriceKobo: 0,
  discountKobo: 0,
  taxRate: "0",
});
export const inputClass =
  "min-h-11 w-full rounded-lg border border-border bg-white px-3 py-2";
