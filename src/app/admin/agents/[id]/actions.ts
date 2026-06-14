// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level implementation
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/agents/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export { getAgentById } from "@/modules/admin/agents/actions";
export type { AgentDetail, GetAgentByIdInput } from "@/modules/admin/agents/schemas";
