// ---------------------------------------------------------------------------
// Maps — barrel exports
// ---------------------------------------------------------------------------

export {
  geocode,
  reverseGeocode
} from "./actions";

export type {
  GeocodeParams,
  ReverseGeocodeParams,
  GeocodeResult,
  ReverseGeocodeResult
} from "./schemas";

export {
  geocodeSchema,
  reverseGeocodeSchema,
  geocodeResultItemSchema,
  geocodeResultSchema,
  reverseGeocodeResultItemSchema,
  reverseGeocodeResultSchema
} from "./schemas";
