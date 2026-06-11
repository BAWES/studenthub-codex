import { describe, it, expect } from "vitest";
import {
  geocodeSchema,
  reverseGeocodeSchema,
  geocodeResultItemSchema,
  reverseGeocodeResultItemSchema,
  geocodeResultSchema,
  reverseGeocodeResultSchema,
  type GeocodeResult,
  type ReverseGeocodeResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Tests: geocodeSchema
// ---------------------------------------------------------------------------

describe("geocodeSchema", () => {
  it("accepts valid input with defaults", () => {
    const result = geocodeSchema.safeParse({ query: "Kuwait" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(20);
      expect(result.data.type).toBe("area");
    }
  });

  it("accepts country type", () => {
    const result = geocodeSchema.safeParse({ query: "Kuwait", type: "country" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("country");
    }
  });

  it("rejects empty query", () => {
    const result = geocodeSchema.safeParse({ query: "" });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = geocodeSchema.safeParse({ query: "Kuwait", limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = geocodeSchema.safeParse({ query: "Kuwait", type: "invalid" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: reverseGeocodeSchema
// ---------------------------------------------------------------------------

describe("reverseGeocodeSchema", () => {
  it("accepts valid coordinates", () => {
    const result = reverseGeocodeSchema.safeParse({
      latitude: 29.3697,
      longitude: 47.9783,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.radius).toBe(10);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects latitude out of range", () => {
    const result = reverseGeocodeSchema.safeParse({
      latitude: 100,
      longitude: 47.9783,
    });
    expect(result.success).toBe(false);
  });

  it("rejects longitude out of range", () => {
    const result = reverseGeocodeSchema.safeParse({
      latitude: 29.3697,
      longitude: 200,
    });
    expect(result.success).toBe(false);
  });

  it("accepts custom radius and limit", () => {
    const result = reverseGeocodeSchema.safeParse({
      latitude: 29.3697,
      longitude: 47.9783,
      radius: 50,
      limit: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.radius).toBe(50);
      expect(result.data.limit).toBe(5);
    }
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: geocodeResultItemSchema
// ---------------------------------------------------------------------------

const validGeocodeResult: GeocodeResult = {
  uuid: "KW",
  name: "Kuwait",
  nameAr: "الكويت",
  type: "country",
  countryId: 1,
  latitude: 29.3697,
  longitude: 47.9783,
  iso: "KWT",
  emoji: "🇰🇼",
};

describe("geocodeResultItemSchema", () => {
  it("accepts a valid country result", () => {
    const result = geocodeResultItemSchema.parse(validGeocodeResult);
    expect(result.uuid).toBe("KW");
    expect(result.type).toBe("country");
  });

  it("accepts a valid area result", () => {
    const result = geocodeResultItemSchema.parse({
      uuid: "area_1",
      name: "Salmiya",
      nameAr: "السالمية",
      type: "area",
      countryId: 1,
      latitude: 29.3333,
      longitude: 48.0667,
      iso: null,
      emoji: null,
    });
    expect(result.type).toBe("area");
  });

  it("rejects wrong type", () => {
    expect(() =>
      geocodeResultItemSchema.parse({ ...validGeocodeResult, type: "invalid" }),
    ).toThrow();
  });

  it("rejects missing required uuid", () => {
    const { uuid, ...rest } = validGeocodeResult;
    expect(() => geocodeResultItemSchema.parse(rest)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: geocodeResultSchema (array)
// ---------------------------------------------------------------------------

describe("geocodeResultSchema", () => {
  it("accepts an array of results", () => {
    const result = geocodeResultSchema.parse([validGeocodeResult]);
    expect(result).toHaveLength(1);
  });

  it("accepts an empty array", () => {
    const result = geocodeResultSchema.parse([]);
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: reverseGeocodeResultItemSchema
// ---------------------------------------------------------------------------

const validReverseGeocodeResult: ReverseGeocodeResult = {
  uuid: "area_123",
  name: "Salmiya",
  nameAr: "السالمية",
  type: "area",
  countryName: "Kuwait",
  latitude: 29.3333,
  longitude: 48.0667,
  distance: 2.5,
};

describe("reverseGeocodeResultItemSchema", () => {
  it("accepts a valid result", () => {
    const result = reverseGeocodeResultItemSchema.parse(validReverseGeocodeResult);
    expect(result.name).toBe("Salmiya");
    expect(result.distance).toBe(2.5);
  });

  it("enforces literal type 'area'", () => {
    expect(() =>
      reverseGeocodeResultItemSchema.parse({
        ...validReverseGeocodeResult,
        type: "country",
      }),
    ).toThrow();
  });

  it("rejects missing latitude", () => {
    const { latitude, ...rest } = validReverseGeocodeResult;
    expect(() => reverseGeocodeResultItemSchema.parse(rest)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: reverseGeocodeResultSchema (array)
// ---------------------------------------------------------------------------

describe("reverseGeocodeResultSchema", () => {
  it("accepts an array of results", () => {
    const result = reverseGeocodeResultSchema.parse([validReverseGeocodeResult]);
    expect(result).toHaveLength(1);
  });

  it("accepts an empty array", () => {
    const result = reverseGeocodeResultSchema.parse([]);
    expect(result).toHaveLength(0);
  });
});
