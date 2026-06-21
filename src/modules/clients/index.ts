// ---------------------------------------------------------------------------
// Clients — barrel exports
// ---------------------------------------------------------------------------

export {
  listClients,
  getClient,
  createClient,
  updateClient
} from "./actions";

export type {
  ListClientsInput,
  CreateClientInput,
  UpdateClientInput,
  ClientListItem,
  ClientDetail,
  ListClientsResult
} from "./schemas";

export {
  listClientsSchema,
  getClientSchema,
  createClientSchema,
  updateClientSchema,
  clientListItemSchema,
  listClientsResultSchema,
  clientDetailSchema,
  getClientResultSchema,
  clientMutationResultSchema
} from "./schemas";
