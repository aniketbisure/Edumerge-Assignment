/**
 * Safely extracts an error message from a value of unknown type
 * (typically used in catch blocks)
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};
