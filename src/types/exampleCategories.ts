export const EXAMPLE_CATEGORIES = [
  "Sequences",
  "Series",
  "Functions and Continuity",
  "Complex Numbers and Trigonometric Functions",
  "Differentiation",
  "Integration",
  "Convergence of Function Sequences",
] as const;

export const UNCATEGORIZED = "Uncategorized" as const;

export const EXAMPLE_CATEGORIES_WITH_FALLBACK = [
  ...EXAMPLE_CATEGORIES,
  UNCATEGORIZED,
] as const;

export function orderedCategoryKeys<T>(
  grouped: Record<string, T[]>,
  { includeUncategorized = true }: { includeUncategorized?: boolean } = {}
) {
  const order = includeUncategorized
    ? EXAMPLE_CATEGORIES_WITH_FALLBACK
    : EXAMPLE_CATEGORIES;

  return order.filter((c) => (grouped[c]?.length ?? 0) > 0);
}