import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listBankTransactionsSchema = z.object({
  isReconciled: z.coerce.boolean().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional(),
  contactName: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  reference: z.string().optional(),
  sortBy: z.enum(["date", "total", "created_at", "updated_at"]).optional().default("date"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getBankTransactionSchema = z.object({
  bankTransactionId: z.string().min(1, "Bank transaction ID is required"),
});

export type ListBankTransactionsInput = z.input<typeof listBankTransactionsSchema>;
export type ListBankTransactionsParams = ListBankTransactionsInput;
export type GetBankTransactionInput = z.input<typeof getBankTransactionSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const bankTransactionItemSchema = z.object({
  bankTransactionId: z.string(),
  contactId: z.string().nullable(),
  contactName: z.string().nullable(),
  reference: z.string().nullable(),
  status: z.string().nullable(),
  type: z.string().nullable(),
  total: z.number().nullable(),
  subTotal: z.number().nullable(),
  totalTax: z.number().nullable(),
  currencyCode: z.string().nullable(),
  isReconciled: z.boolean().nullable(),
  hasAttachments: z.boolean().nullable(),
  date: z.date().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type BankTransactionItem = z.output<typeof bankTransactionItemSchema>;
export type BankTransactionDetail = BankTransactionItem & {
  currencyRate: number | null;
  lineAmountTypes: string | null;
  overpaymentId: string | null;
  prepaymentId: string | null;
  statusAttributeString: string | null;
  url: string | null;
  validationErrors: string | null;
  lineItems: Array<{
    lineItemId: string;
    description: string | null;
    accountCode: string | null;
    lineAmount: number | null;
    unitAmount: number | null;
    quantity: number | null;
    taxAmount: number | null;
    taxType: string | null;
  }>;
};

// Since BankTransactionDetail extends BankTransactionItem with extra fields
// and a nested lineItems array, we use a separate detail schema for validation.
export const bankTransactionDetailSchema = z.object({
  // BankTransactionItem fields
  bankTransactionId: z.string(),
  contactId: z.string().nullable(),
  contactName: z.string().nullable(),
  reference: z.string().nullable(),
  status: z.string().nullable(),
  type: z.string().nullable(),
  total: z.number().nullable(),
  subTotal: z.number().nullable(),
  totalTax: z.number().nullable(),
  currencyCode: z.string().nullable(),
  isReconciled: z.boolean().nullable(),
  hasAttachments: z.boolean().nullable(),
  date: z.date().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
  // Detail-specific fields
  currencyRate: z.number().nullable(),
  lineAmountTypes: z.string().nullable(),
  overpaymentId: z.string().nullable(),
  prepaymentId: z.string().nullable(),
  statusAttributeString: z.string().nullable(),
  url: z.string().nullable(),
  validationErrors: z.string().nullable(),
  // Line items
  lineItems: z.array(
    z.object({
      lineItemId: z.string(),
      description: z.string().nullable(),
      accountCode: z.string().nullable(),
      lineAmount: z.number().nullable(),
      unitAmount: z.number().nullable(),
      quantity: z.number().nullable(),
      taxAmount: z.number().nullable(),
      taxType: z.string().nullable(),
    }),
  ),
});

export type BankTransactionDetailOutput = z.output<typeof bankTransactionDetailSchema>;

export const listBankTransactionsResultSchema = z.object({
  transactions: z.array(bankTransactionItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type ListBankTransactionsResult = z.output<typeof listBankTransactionsResultSchema>;

export const reconciliationStatusSchema = z.object({
  totalCount: z.number(),
  reconciledCount: z.number(),
  unreconciledCount: z.number(),
  reconciledPercentage: z.number(),
});

export type ReconciliationStatus = z.output<typeof reconciliationStatusSchema>;
