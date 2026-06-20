import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listPaymentsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getPaymentDetailSchema = z.object({
  tcId: z.coerce.number().int().positive("Transfer candidate ID must be a positive integer"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListPaymentsParams = z.input<typeof listPaymentsSchema>;
export type GetPaymentDetailParams = {
  tcId: string | number;
};

export type PaymentRow = {
  id: number;
  transferId: number | null;
  company: string;
  period: string;
  hours: string;
  candidateTotal: string;
  companyTotal: string;
  cost: string;
  paid: string;
  paymentDate: string;
  updated: string;
};

export type ListPaymentsResult = {
  items: PaymentRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaymentDetailTransfer = {
  id: number | null;
  period: string;
  paymentReceived: string;
};

export type PaymentDetail = {
  id: number;
  transferId: number | null;
  company: string;
  store: string | null;
  hours: string;
  hourlyRate: string;
  candidateTotal: string;
  companyTotal: string;
  cost: string;
  bonus: string;
  paid: string;
  beneficiary: string | null;
  iban: string | null;
  bank: string | null;
  created: string;
  updated: string;
};

export type GetPaymentDetailResult = {
  transferCandidate: PaymentDetail;
  transfer: PaymentDetailTransfer | null;
  invoices: { id: number; date: Date | null; status: string | null }[];
};

// ---------------------------------------------------------------------------
// Create Payment
// ---------------------------------------------------------------------------

export const createPaymentSchema = z.object({
  transferBenefName: z
    .string({ required_error: "Beneficiary name is required" })
    .min(1, "Beneficiary name is required")
    .max(60),
  transferBenefIban: z
    .string({ required_error: "IBAN is required" })
    .min(1, "IBAN is required")
    .max(50),
  bankId: z.number({ required_error: "Bank is required" }).int().positive(),
  amount: z.number().positive("Amount must be positive").optional(),
});

export type CreatePaymentInput = z.input<typeof createPaymentSchema>;

// ---------------------------------------------------------------------------
// Payment Methods
// ---------------------------------------------------------------------------

export type PaymentMethod = {
  bankId: number | null;
  bankName: string | null;
  bankAccountName: string | null;
  iban: string | null;
};

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const paymentRowOutputSchema = z.object({
  id: z.number(),
  transferId: z.number().nullable(),
  company: z.string(),
  period: z.string(),
  hours: z.string(),
  candidateTotal: z.string(),
  companyTotal: z.string(),
  cost: z.string(),
  paid: z.string(),
  paymentDate: z.string(),
  updated: z.string(),
});

export const listPaymentsResultOutputSchema = z.object({
  items: z.array(paymentRowOutputSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const paymentDetailTransferOutputSchema = z.object({
  id: z.number().nullable(),
  period: z.string(),
  paymentReceived: z.string(),
});

export const paymentDetailOutputSchema = z.object({
  id: z.number(),
  transferId: z.number().nullable(),
  company: z.string(),
  store: z.string().nullable(),
  hours: z.string(),
  hourlyRate: z.string(),
  candidateTotal: z.string(),
  companyTotal: z.string(),
  cost: z.string(),
  bonus: z.string(),
  paid: z.string(),
  beneficiary: z.string().nullable(),
  iban: z.string().nullable(),
  bank: z.string().nullable(),
  created: z.string(),
  updated: z.string(),
});

const paymentInvoiceOutputSchema = z.object({
  id: z.number(),
  date: z.date().nullable(),
  status: z.string().nullable(),
});

export const getPaymentDetailResultOutputSchema = z.object({
  transferCandidate: paymentDetailOutputSchema,
  transfer: paymentDetailTransferOutputSchema.nullable(),
  invoices: z.array(paymentInvoiceOutputSchema),
});

export const paymentMethodOutputSchema = z.object({
  bankId: z.number().nullable(),
  bankName: z.string().nullable(),
  bankAccountName: z.string().nullable(),
  iban: z.string().nullable(),
});

export const createPaymentResultOutputSchema = z.object({
  tcId: z.number(),
});
