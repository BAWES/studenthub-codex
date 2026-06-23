// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level [id] implementation
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/admin/agents/[id]/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export { getAgentById } from "@/modules/admin/agents/[id]/actions";
export type { AgentDetail, GetAgentByIdInput } from "@/modules/admin/agents/[id]/schemas";
