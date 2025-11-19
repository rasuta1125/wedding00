/**
 * Firebase Functions Entry Point
 * WeddingMoments Backend API
 */

import * as admin from "firebase-admin";
import { validateConfig } from "./utils/config";

// Initialize Firebase Admin
admin.initializeApp();

// Validate configuration
validateConfig();

// Export API functions
export { createEvent, updateEvent, deleteEvent } from "./api/events";
export { publishPhotos, downloadAlbum, autoPublishPhotos } from "./api/photos";
export { createOrder, stripeWebhook, updateShippingStatus } from "./api/orders";

// Export image processing functions
export { generateThumbnails, cleanupThumbnails } from "./api/images";

// Export album functions
export { createAlbumZip, cleanupExpiredZips } from "./api/albums";

// Export guest session functions
export {
  createGuestSession,
  validateGuestSession,
  cleanupExpiredSessions,
  getGuestStats,
} from "./api/guests";

// Export admin functions
export {
  getDashboardStats,
  getOrders,
  getEventStats,
  updateOrderStatus,
  getUsers,
  setAdminRole,
} from "./api/admin";
