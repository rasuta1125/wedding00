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

// Export image processing functions (to be implemented)
// export { generateThumbnails } from "./api/images";
