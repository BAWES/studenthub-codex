import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas for candidate payments module
// ---------------------------------------------------------------------------

export const listPaymentsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getPaymentDetailSchema = z.object({
  tcId: z.coerce.number().int().positive("Transfer candidate ID must be a positive integer"),
});

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

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export type ListPaymentsParams = z.input<typeof listPaymentsSchema>;
export type CreatePaymentInput = z.input<typeof createPaymentSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const paymentRowSchema = z.object({
  id: z.number().int(),
  transferId: z.number().int().nullable(),
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

export const listPaymentsResultSchema = z.object({
  items: z.array(paymentRowSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const paymentDetailTransferSchema = z.object({
  id: z.number().int().nullable(),
  period: z.string(),
  paymentReceived: z.string(),
});

export const paymentDetailSchema = z.object({
  id: z.number().int(),
  transferId: z.number().int().nullable(),
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

export const paymentDetailInvoiceSchema = z.object({
  id: z.number().int(),
  date: z.date().nullable(),
  status: z.string().nullable(),
});

export const getPaymentDetailResultSchema = z.object({
  transferCandidate: paymentDetailSchema,
  transfer: paymentDetailTransferSchema.nullable(),
  invoices: z.array(paymentDetailInvoiceSchema),
});

export const paymentMethodSchema = z.object({
  bankId: z.number().int().nullable(),
  bankName: z.string().nullable(),
  bankAccountName: z.string().nullable(),
  iban: z.string().nullable(),
});

export const createPaymentResultSchema = z.object({
  tcId: z.number().int(),
});

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export type PaymentRow = z.output<typeof paymentRowSchema>;
export type ListPaymentsResult = z.output<typeof listPaymentsResultSchema>;
export type PaymentDetailTransfer = z.output<typeof paymentDetailTransferSchema>;
export type PaymentDetail = z.output<typeof paymentDetailSchema>;
export type GetPaymentDetailResult = z.output<typeof getPaymentDetailResultSchema>;
export type PaymentMethod = z.output<typeof paymentMethodSchema>;
