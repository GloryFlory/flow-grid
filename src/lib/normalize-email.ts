/**
 * Email normalization utility
 * Ensures consistent email comparison across the app
 */

export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
