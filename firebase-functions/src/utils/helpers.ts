import * as admin from "firebase-admin";
import * as crypto from "crypto";

/**
 * Generate a secure random token
 */
export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Generate order number
 * Format: WM20250125-001
 */
export const generateOrderNumber = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  
  return `WM${year}${month}${day}-${random}`;
};

/**
 * Calculate tax amount (10% in Japan)
 */
export const calculateTax = (amount: number): number => {
  return Math.floor(amount * 0.1);
};

/**
 * Calculate shipping cost based on total amount
 */
export const calculateShipping = (subtotal: number): number => {
  if (subtotal >= 10000) return 0; // Free shipping over ¥10,000
  return 800;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Japanese format)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^0\d{1,4}-?\d{1,4}-?\d{4}$/;
  return phoneRegex.test(phone);
};

/**
 * Generate thumbnail URL path
 */
export const getThumbnailPath = (originalPath: string): string => {
  const parts = originalPath.split("/");
  const filename = parts.pop();
  const dir = parts.join("/");
  
  return `${dir}/thumbnails/thumb_200x200_${filename}`;
};

/**
 * Generate medium size URL path
 */
export const getMediumPath = (originalPath: string): string => {
  const parts = originalPath.split("/");
  const filename = parts.pop();
  const dir = parts.join("/");
  
  return `${dir}/medium/medium_800x800_${filename}`;
};

/**
 * Format timestamp to ISO date string
 */
export const formatDate = (timestamp: admin.firestore.Timestamp): string => {
  return timestamp.toDate().toISOString().split("T")[0];
};

/**
 * Get current timestamp
 */
export const now = (): admin.firestore.Timestamp => {
  return admin.firestore.Timestamp.now();
};

/**
 * Add days to timestamp
 */
export const addDays = (
  timestamp: admin.firestore.Timestamp,
  days: number
): admin.firestore.Timestamp => {
  const date = timestamp.toDate();
  date.setDate(date.getDate() + days);
  return admin.firestore.Timestamp.fromDate(date);
};

/**
 * Sanitize filename
 */
export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (context: any): boolean => {
  return !!context.auth;
};

/**
 * Get user ID from context
 */
export const getUserId = (context: any): string | null => {
  return context.auth?.uid || null;
};
