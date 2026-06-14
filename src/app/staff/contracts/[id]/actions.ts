// ---------------------------------------------------------------------------
// Barrel re-export — delegates to app-level implementation
// ---------------------------------------------------------------------------
// The app-level actions.ts already re-exports getContractDetail from
// the module-level implementation. This barrel keeps import paths clean
// for page consumers.
// ---------------------------------------------------------------------------

export { getContractDetail } from "../actions";
