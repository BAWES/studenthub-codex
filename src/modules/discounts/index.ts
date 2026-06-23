// ---------------------------------------------------------------------------
// Discounts — barrel exports
// ---------------------------------------------------------------------------

export {
  listDiscounts,
  createDiscount,
  listDiscountsByApplicant
} from "./actions";

export type {
  CreateDiscountInput,
  ListDiscountsInput,
  ListDiscountsByApplicantInput,
  DiscountListItem,
  ListDiscountsResult,
  CreateDiscountResult
} from "./schemas";

export {
  createDiscountSchema,
  listDiscountsSchema,
  listDiscountsByApplicantSchema,
  discountItemSchema,
  createDiscountResultSchema,
  listDiscountsResultSchema
} from "./schemas";
