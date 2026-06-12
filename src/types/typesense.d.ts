declare module "typesense" {
  import Client from "typesense/lib/Typesense/Client";
  export { Client };
  export { default as SearchClient } from "typesense/lib/Typesense/SearchClient";
  import * as Errors from "typesense/lib/Typesense/Errors";
  export { Errors };
}
