export function formatDate(value: Date | null | undefined) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(value);
}

export function formatMoney(value: unknown, currency = "KWD") {
  if (value === null || value === undefined) return "0";
  const normalized = typeof value === "object" && "toString" in value ? value.toString() : String(value);
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(Number(normalized))} ${currency}`;
}
