// ---------------------------------------------------------------------------
// Admin Agents — Server Actions (page-level re-exports)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/agents/actions.ts (which has
// "use server"). This barrel re-exports so page consumers keep their current
// import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export {
  getAllAgentsHealth,
  type AgentHealthData,
  type AgentHealthMetric,
  type AgentsHealthData,
} from "@/modules/admin/agents/actions";
