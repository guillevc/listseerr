/**
 * Format a date for display.
 */
export function formatDate(date?: Date | string | null): string {
  if (!date) return 'Never';
  const d = new Date(date);
  return d.toLocaleString();
}

/**
 * Truncate text from the tail (show leading characters).
 */
export function truncateTail(text: string, maxLength = 30): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}
