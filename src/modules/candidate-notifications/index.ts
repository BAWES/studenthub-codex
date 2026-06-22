// ---------------------------------------------------------------------------
// Candidate-notifications — barrel exports
// ---------------------------------------------------------------------------

export {
  listCandidateNotifications,
  getCandidateNotification,
  createNotification,
  markNotificationRead
} from "./actions";

export type {
  ListCandidateNotificationsInput,
  CandidateNotificationItem,
  CandidateNotificationDetail,
  ListCandidateNotificationsResult,
  CreateNotificationInput,
  CreateNotificationResult,
  CandidateNotificationItemSchema,
  ListCandidateNotificationsResultSchema,
  CreateNotificationResultSchema,
  MarkNotificationReadResultSchema
} from "./schemas";

export {
  listCandidateNotificationsSchema,
  getCandidateNotificationSchema,
  createNotificationSchema,
  candidateNotificationItemSchema,
  listCandidateNotificationsResultSchema,
  createNotificationResultSchema,
  markNotificationReadResultSchema
} from "./schemas";
