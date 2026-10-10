export function explainError(error: unknown): string {
  if (error instanceof Error) {
    if (/failed to fetch|network|fetch/i.test(error.message)) return 'Network connection unavailable. Check your connection and try again.';
    if (/invalid login credentials|incorrect/i.test(error.message)) return 'Email or password is incorrect.';
    if (/user already registered|already exists/i.test(error.message)) return 'An account with this email already exists. Try signing in instead.';
    if (/password should be at least/i.test(error.message)) return 'Use a password with at least 8 characters.';
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
