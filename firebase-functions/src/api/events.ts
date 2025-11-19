import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { CreateEventRequest, CreateEventResponse } from "../types";
import { generateToken, now } from "../utils/helpers";
import { generateAndUploadQRCode } from "../utils/qrcode";
import { config } from "../utils/config";

const db = admin.firestore();

/**
 * Create a new event
 */
export const createEvent = functions
  .region(config.app.region)
  .https.onCall(async (data: CreateEventRequest, context): Promise<CreateEventResponse> => {
    try {
      // Check authentication
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User must be authenticated"
        );
      }

      const userId = context.auth.uid;

      // Validate input
      if (!data.eventName || !data.eventDate) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Event name and date are required"
        );
      }

      if (!data.guestLimit || data.guestLimit < 1) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Guest limit must be at least 1"
        );
      }

      // Generate QR token
      const qrToken = generateToken(32);

      // Create event document
      const eventRef = await db.collection("events").add({
        hostUserId: userId,
        eventName: data.eventName,
        eventDate: data.eventDate,
        eventLocation: data.eventLocation || null,
        qrToken,
        qrCodeUrl: "", // Will be updated after QR code generation
        guestLimit: data.guestLimit,
        currentGuestCount: 0,
        status: "active",
        photosPublishedAt: null,
        autoPublish: data.autoPublish !== undefined ? data.autoPublish : true,
        publishTime: data.publishTime || "09:00",
        settings: {
          allowGuestDownload: true,
          watermark: false,
          compressionQuality: 0.8,
        },
        subscriptionTier: "basic",
        stripeSubscriptionId: null,
        createdAt: now(),
        updatedAt: now(),
      });

      const eventId = eventRef.id;

      // Generate QR code
      const qrCodeUrl = await generateAndUploadQRCode(
        eventId,
        qrToken,
        config.app.webUrl
      );

      // Update event with QR code URL
      await eventRef.update({
        qrCodeUrl,
        updatedAt: now(),
      });

      return {
        success: true,
        eventId,
        qrCodeUrl,
        qrToken,
      };
    } catch (error: any) {
      console.error("Error creating event:", error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        "internal",
        "Failed to create event: " + error.message
      );
    }
  });

/**
 * Update event
 */
export const updateEvent = functions
  .region(config.app.region)
  .https.onCall(async (data: any, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User must be authenticated"
        );
      }

      const userId = context.auth.uid;
      const { eventId, ...updateData } = data;

      if (!eventId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Event ID is required"
        );
      }

      // Verify ownership
      const eventDoc = await db.collection("events").doc(eventId).get();
      
      if (!eventDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Event not found"
        );
      }

      const event = eventDoc.data();
      if (event?.hostUserId !== userId) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "You don't have permission to update this event"
        );
      }

      // Update event
      await db.collection("events").doc(eventId).update({
        ...updateData,
        updatedAt: now(),
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error updating event:", error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        "internal",
        "Failed to update event"
      );
    }
  });

/**
 * Delete (archive) event
 */
export const deleteEvent = functions
  .region(config.app.region)
  .https.onCall(async (data: { eventId: string }, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User must be authenticated"
        );
      }

      const userId = context.auth.uid;
      const { eventId } = data;

      if (!eventId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Event ID is required"
        );
      }

      // Verify ownership
      const eventDoc = await db.collection("events").doc(eventId).get();
      
      if (!eventDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Event not found"
        );
      }

      const event = eventDoc.data();
      if (event?.hostUserId !== userId) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "You don't have permission to delete this event"
        );
      }

      // Soft delete (archive)
      await db.collection("events").doc(eventId).update({
        status: "archived",
        updatedAt: now(),
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error deleting event:", error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        "internal",
        "Failed to delete event"
      );
    }
  });
