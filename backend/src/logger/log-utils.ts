export function serializeValue(
  value: unknown,
  treatNullAsEmpty = false,
): string {
  if (typeof value === 'string') return value;

  if (value === null || value === undefined) {
    return treatNullAsEmpty ? '' : String(value);
  }

  if (value instanceof Error) return value.message;

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}
