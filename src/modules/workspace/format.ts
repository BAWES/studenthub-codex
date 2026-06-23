export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Not set";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function formatMoney(value: unknown, currency = "KWD") {
  if (value === null || value === undefined) return "0";
  const normalized = typeof value === "object" && "toString" in value ? value.toString() : String(value);
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(Number(normalized))} ${currency}`;
}
