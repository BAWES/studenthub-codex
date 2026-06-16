// ---------------------------------------------------------------------------
// Admin Stores - barrel exports
// ---------------------------------------------------------------------------

export {
  listStores,
  getStore,
  createStore,
  updateStore,
  deleteStore,
} from "./actions";

export type {
  ListStoresInput,
  GetStoreInput,
  CreateStoreInput,
  UpdateStoreInput,
  DeleteStoreInput,
  StoreRow,
  StoreDetail,
  StoreActionResult,
  ListStoresResult,
} from "./schemas";

export {
  listStoresSchema,
  getStoreSchema,
  createStoreSchema,
  updateStoreSchema,
  deleteStoreSchema,
  storeRowSchema,
  storeDetailSchema,
  listStoresResultSchema,
  storeActionResultSchema,
} from "./schemas";
