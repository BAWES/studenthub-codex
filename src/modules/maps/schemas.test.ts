import { describe, it, expect } from "vitest";
import {
  geocodeResultItemSchema,
  geocodeResultSchema,
  reverseGeocodeResultItemSchema,
  reverseGeocodeResultSchema,
} from "./schemas";

const validGeo = {
  uuid: "area-uuid-1", name: "Salmiya", nameAr: "السالمية",
  type: "area", countryId: 1, latitude: 29.33, longitude: 48.08,
  iso: "KW", emoji: "🇰🇼",
};

describe("geocodeResultItemSchema", () => {
  it("accepts a valid geocode result item", () => {
    expect(geocodeResultItemSchema.safeParse(validGeo).success).toBe(true);
  });
  it("accepts nullable fields as null", () => {
    expect(geocodeResultItemSchema.safeParse({
      ...validGeo, nameAr: null, countryId: null, latitude: null,
      longitude: null, iso: null, emoji: null,
    }).success).toBe(true);
  });
  it("rejects invalid type", () => {
    expect(geocodeResultItemSchema.safeParse({ ...validGeo, type: "city" }).success).toBe(false);
  });
  it("rejects missing uuid", () => {
    const { uuid: _, ...rest } = validGeo;
    expect(geocodeResultItemSchema.safeParse(rest).success).toBe(false);
  });
});

describe("geocodeResultSchema", () => {
  it("accepts an array of items", () => {
    expect(geocodeResultSchema.safeParse([validGeo]).success).toBe(true);
  });
  it("accepts empty array", () => expect(geocodeResultSchema.safeParse([]).success).toBe(true));
  it("rejects non-array", () => expect(geocodeResultSchema.safeParse({}).success).toBe(false));
});

const validReverse = {
  uuid: "area-uuid-1", name: "Salmiya", nameAr: null,
  type: "area", countryName: "Kuwait", latitude: 29.33, longitude: 48.08, distance: 1.5,
};

describe("reverseGeocodeResultItemSchema", () => {
  it("accepts a valid reverse geocode item", () => {
    expect(reverseGeocodeResultItemSchema.safeParse(validReverse).success).toBe(true);
  });
  it("rejects non-area type", () => {
    expect(reverseGeocodeResultItemSchema.safeParse({ ...validReverse, type: "country" }).success).toBe(false);
  });
  it("rejects missing uuid", () => {
    const { uuid: _, ...rest } = validReverse;
    expect(reverseGeocodeResultItemSchema.safeParse(rest).success).toBe(false);
  });
});

describe("reverseGeocodeResultSchema", () => {
  it("accepts an array of items", () => {
    expect(reverseGeocodeResultSchema.safeParse([validReverse]).success).toBe(true);
  });
  it("accepts empty array", () => expect(reverseGeocodeResultSchema.safeParse([]).success).toBe(true));
  it("rejects non-array", () => expect(reverseGeocodeResultSchema.safeParse("x").success).toBe(false));
});
