// ---------------------------------------------------------------------------
// Staff-notifications — barrel exports
// ---------------------------------------------------------------------------

export {
  listStaffNotifications,
  getStaffNotification,
  markNotificationRead
} from "./actions";

export type {
  StaffNotificationItem,
  ListStaffNotificationsResult,
  MarkNotificationReadResult
} from "./schemas";

export {
  staffNotificationItemSchema,
  listStaffNotificationsResultSchema,
  markNotificationReadResultSchema
} from "./schemas";
