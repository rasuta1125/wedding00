import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { now } from "../utils/helpers";
import { config } from "../utils/config";
import { sendPhotoPublishedEmail } from "../utils/email";

const db = admin.firestore();

/**
 * Publish all photos for an event
 */
export const publishPhotos = functions
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
          "You don't have permission to publish photos for this event"
        );
      }

      const timestamp = now();

      // Update event
      await db.collection("events").doc(eventId).update({
        photosPublishedAt: timestamp,
        updatedAt: timestamp,
      });

      // Publish all photos for this event
      const photosQuery = db
        .collection("photos")
        .where("eventId", "==", eventId)
        .where("isPublished", "==", false);
      
      const photosSnapshot = await photosQuery.get();
      
      const batch = db.batch();
      photosSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          isPublished: true,
          publishedAt: timestamp,
        });
      });
      
      await batch.commit();

      console.log(`Published ${photosSnapshot.size} photos for event ${eventId}`);

      // TODO: Send notification emails to guests
      // This would require storing guest emails in a separate collection

      return {
        success: true,
        publishedCount: photosSnapshot.size,
      };
    } catch (error: any) {
      console.error("Error publishing photos:", error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        "internal",
        "Failed to publish photos"
      );
    }
  });

/**
 * Generate album download (ZIP file)
 */
export const downloadAlbum = functions
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
          "You don't have permission to download photos from this event"
        );
      }

      // Get all published photos
      const photosQuery = db
        .collection("photos")
        .where("eventId", "==", eventId)
        .where("isPublished", "==", true);
      
      const photosSnapshot = await photosQuery.get();

      if (photosSnapshot.empty) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "No published photos found for this event"
        );
      }

      // TODO: Create ZIP file and upload to Storage
      // For now, return array of photo URLs
      const photoUrls = photosSnapshot.docs.map((doc) => {
        const data = doc.data();
        return data.originalUrl;
      });

      // In production, this would:
      // 1. Create a ZIP file with all photos
      // 2. Upload to Firebase Storage
      // 3. Generate a signed URL with expiration
      // 4. Return the download URL

      return {
        success: true,
        photoCount: photoUrls.length,
        // downloadUrl: "https://storage.googleapis.com/.../album.zip",
        // expiresAt: timestamp,
        photoUrls, // Temporary: return URLs for manual download
      };
    } catch (error: any) {
      console.error("Error generating album download:", error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        "internal",
        "Failed to generate album download"
      );
    }
  });

/**
 * Auto-publish photos scheduled function
 * Runs every day at midnight
 */
export const autoPublishPhotos = functions
  .region(config.app.region)
  .pubsub.schedule("0 0 * * *")
  .timeZone("Asia/Tokyo")
  .onRun(async (context) => {
    try {
      const now = new Date();
      const today = now.toISOString().split("T")[0];

      // Find events that should auto-publish today
      const eventsQuery = db
        .collection("events")
        .where("autoPublish", "==", true)
        .where("photosPublishedAt", "==", null)
        .where("status", "==", "active");

      const eventsSnapshot = await eventsQuery.get();

      for (const eventDoc of eventsSnapshot.docs) {
        const event = eventDoc.data();
        const eventDate = event.eventDate;
        
        // Check if event was yesterday
        const eventDateObj = new Date(eventDate);
        const nextDay = new Date(eventDateObj);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const nextDayStr = nextDay.toISOString().split("T")[0];
        
        if (nextDayStr === today) {
          // Publish photos for this event
          const timestamp = admin.firestore.Timestamp.now();
          
          await eventDoc.ref.update({
            photosPublishedAt: timestamp,
            updatedAt: timestamp,
          });

          // Publish all photos
          const photosQuery = db
            .collection("photos")
            .where("eventId", "==", eventDoc.id)
            .where("isPublished", "==", false);
          
          const photosSnapshot = await photosQuery.get();
          
          const batch = db.batch();
          photosSnapshot.docs.forEach((doc) => {
            batch.update(doc.ref, {
              isPublished: true,
              publishedAt: timestamp,
            });
          });
          
          await batch.commit();

          console.log(
            `Auto-published ${photosSnapshot.size} photos for event ${eventDoc.id}`
          );
        }
      }

      return null;
    } catch (error) {
      console.error("Error in auto-publish scheduled function:", error);
      throw error;
    }
  });
