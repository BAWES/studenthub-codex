"use server";

// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level implementation
// ---------------------------------------------------------------------------

export {
  getAllAgentsHealth,
  type AgentHealthData,
  type AgentHealthMetric,
  type AgentsHealthData,
} from "@/modules/admin/agents/actions";
