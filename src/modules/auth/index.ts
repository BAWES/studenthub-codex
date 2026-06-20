// ---------------------------------------------------------------------------
// Auth — barrel exports
// ---------------------------------------------------------------------------

export {
  loginAction,
  chooseAccountAction,
  verifySession,
  logoutAction,
  switchRoleAction,
  changePassword
} from "./actions";

export type {
  ChangePasswordState
} from "./schemas";

export {
  loginStateSchema,
  changePasswordStateSchema,
  verifySessionAuthenticatedSchema,
  verifySessionUnauthenticatedSchema,
  verifySessionResultSchema,
  switchRoleSchema
} from "./schemas";
