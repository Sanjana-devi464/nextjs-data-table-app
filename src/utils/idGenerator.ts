let idCounter = 0;

/**
 * Generate a unique ID that's consistent between server and client
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${++idCounter}`;
}

/**
 * Generate a unique ID using current timestamp and random number
 * Use this for client-side only operations
 */
export function generateClientId(prefix: string = 'id'): string {
  // Always use the counter-based ID to prevent hydration mismatches
  return generateId(prefix);
}

/**
 * Reset the counter (useful for testing)
 */
export function resetIdCounter(): void {
  idCounter = 0;
}
