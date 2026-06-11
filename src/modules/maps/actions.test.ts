import { describe, it, expect } from "vitest";
import {
  geocodeSchema,
  reverseGeocodeSchema,
  geocodeResultSchema,
  reverseGeocodeResultSchema,
  type GeocodeResult,
  type ReverseGeocodeResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Pure functions for testable logic
// ---------------------------------------------------------------------------

/**
 * Calculate approximate distance in km between two lat/lng points
 * using the Haversine formula.
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function buildGeocodeSearch(query: string): Record<string, any> {
  return {
    OR: [
      { country_name_en: { contains: query, mode: "insensitive" as const } },
      { country_name_ar: { contains: query, mode: "insensitive" as const } },
    ],
  };
}

function buildAreaSearch(query: string): Record<string, any> {
  return {
    OR: [
      { area_name_en: { contains: query, mode: "insensitive" as const } },
      { area_name_ar: { contains: query, mode: "insensitive" as const } },
    ],
  };
}

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
// Tests: Pure functions
// ---------------------------------------------------------------------------

describe("haversineDistance", () => {
  it("returns 0 for same point", () => {
    const d = haversineDistance(29.3697, 47.9783, 29.3697, 47.9783);
    expect(d).toBeCloseTo(0, 1);
  });

  it("calculates Kuwait City to London distance (~4,700 km)", () => {
    const d = haversineDistance(29.3697, 47.9783, 51.5074, -0.1278);
    expect(d).toBeGreaterThan(4000);
    expect(d).toBeLessThan(5500);
  });

  it("is commutative", () => {
    const d1 = haversineDistance(29.3, 47.9, 25.2, 55.3);
    const d2 = haversineDistance(25.2, 55.3, 29.3, 47.9);
    expect(d1).toBeCloseTo(d2, 2);
  });
});

describe("buildGeocodeSearch", () => {
  it("builds OR search for country names", () => {
    const result = buildGeocodeSearch("Kuwait");
    expect(result.OR).toHaveLength(2);
    expect(result.OR[0].country_name_en.contains).toBe("Kuwait");
    expect(result.OR[1].country_name_ar.contains).toBe("Kuwait");
  });
});

describe("buildAreaSearch", () => {
  it("builds OR search for area names", () => {
    const result = buildAreaSearch("Salmiya");
    expect(result.OR).toHaveLength(2);
    expect(result.OR[0].area_name_en.contains).toBe("Salmiya");
    expect(result.OR[1].area_name_ar.contains).toBe("Salmiya");
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: geocodeResultSchema
// ---------------------------------------------------------------------------

const validGeocodeCountryResult = {
  uuid: "KW",
  name: "Kuwait",
  nameAr: "الكويت",
  type: "country" as const,
  countryId: 1,
  latitude: 29.3697,
  longitude: 47.9783,
  iso: "KWT",
  emoji: "🇰🇼",
};

const validGeocodeAreaResult = {
  uuid: "area_123",
  name: "Salmiya",
  nameAr: "السالمية",
  type: "area" as const,
  countryId: 5,
  latitude: 29.3333,
  longitude: 48.0667,
  iso: null,
  emoji: null,
};

describe("geocodeResultSchema", () => {
  it("accepts a valid country result", () => {
    const result = geocodeResultSchema.parse(validGeocodeCountryResult);
    expect(result.uuid).toBe("KW");
    expect(result.type).toBe("country");
  });

  it("accepts a valid area result", () => {
    const result = geocodeResultSchema.parse(validGeocodeAreaResult);
    expect(result.uuid).toBe("area_123");
    expect(result.type).toBe("area");
  });

  it("accepts nullable fields as null", () => {
    const result = geocodeResultSchema.parse({
      uuid: "KW",
      name: "Kuwait",
      nameAr: null,
      type: "country",
      countryId: null,
      latitude: null,
      longitude: null,
      iso: null,
      emoji: null,
    });
    expect(result.nameAr).toBeNull();
    expect(result.countryId).toBeNull();
    expect(result.latitude).toBeNull();
    expect(result.longitude).toBeNull();
    expect(result.iso).toBeNull();
    expect(result.emoji).toBeNull();
  });

  it("rejects missing required string field", () => {
    const { uuid, ...rest } = validGeocodeCountryResult;
    expect(() => geocodeResultSchema.parse(rest)).toThrow();
  });

  it("rejects invalid type", () => {
    expect(() =>
      geocodeResultSchema.parse({ ...validGeocodeCountryResult, type: "invalid" }),
    ).toThrow();
  });

  it("rejects wrong type for countryId", () => {
    expect(() =>
      geocodeResultSchema.parse({ ...validGeocodeCountryResult, countryId: "not-a-number" }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: reverseGeocodeResultSchema
// ---------------------------------------------------------------------------

const validReverseGeocodeResult = {
  uuid: "area_456",
  name: "Salmiya",
  nameAr: "السالمية",
  type: "area" as const,
  countryName: "Kuwait",
  latitude: 29.3333,
  longitude: 48.0667,
  distance: 3.14,
};

describe("reverseGeocodeResultSchema", () => {
  it("accepts a valid reverse geocode result", () => {
    const result = reverseGeocodeResultSchema.parse(validReverseGeocodeResult);
    expect(result.uuid).toBe("area_456");
    expect(result.type).toBe("area");
    expect(result.distance).toBe(3.14);
  });

  it("accepts nullable nameAr and countryName", () => {
    const result = reverseGeocodeResultSchema.parse({
      ...validReverseGeocodeResult,
      nameAr: null,
      countryName: null,
    });
    expect(result.nameAr).toBeNull();
    expect(result.countryName).toBeNull();
  });

  it("rejects missing required uuid", () => {
    const { uuid, ...rest } = validReverseGeocodeResult;
    expect(() => reverseGeocodeResultSchema.parse(rest)).toThrow();
  });

  it("rejects non-numeric distance", () => {
    expect(() =>
      reverseGeocodeResultSchema.parse({ ...validReverseGeocodeResult, distance: "not-a-number" }),
    ).toThrow();
  });

  it("rejects non-area type", () => {
    expect(() =>
      reverseGeocodeResultSchema.parse({ ...validReverseGeocodeResult, type: "country" }),
    ).toThrow();
  });

  it("rejects missing latitude", () => {
    const { latitude, ...rest } = validReverseGeocodeResult;
    expect(() => reverseGeocodeResultSchema.parse(rest)).toThrow();
  });
});
