import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { generateToken, now, addDays } from "../utils/helpers";
import { config } from "../utils/config";

const db = admin.firestore();

/**
 * Create guest session
 * Called when guest scans QR code
 */
export const createGuestSession = functions
  .region(config.app.region)
  .https.onCall(async (
    data: { eventId: string; qrToken: string; deviceInfo?: string },
    context
  ) => {
    try {
      const { eventId, qrToken, deviceInfo } = data;

      if (!eventId || !qrToken) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Event ID and QR token are required"
        );
      }

      // Verify event and QR token
      const eventDoc = await db.collection("events").doc(eventId).get();

      if (!eventDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Event not found");
      }

      const event = eventDoc.data();

      if (event?.qrToken !== qrToken) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Invalid QR token"
        );
      }

      // Check event status
      if (event?.status === "archived") {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "This event has ended"
        );
      }

      // Check guest limit
      if (event?.currentGuestCount >= event?.guestLimit) {
        throw new functions.https.HttpsError(
          "resource-exhausted",
          "Guest limit reached"
        );
      }

      // Generate guest token
      const guestToken = generateToken(32);

      // Calculate expiration (event date + 7 days)
      const eventDate = new Date(event?.eventDate);
      const expiresAt = addDays(
        admin.firestore.Timestamp.fromDate(eventDate),
        7
      );

      // Create guest session
      const sessionRef = await db.collection("guestSessions").add({
        eventId,
        guestToken,
        deviceInfo: deviceInfo || "unknown",
        ipAddress: context.rawRequest?.ip || "unknown",
        expiresAt,
        lastAccessAt: now(),
        createdAt: now(),
      });

      // Increment guest count
      await eventDoc.ref.update({
        currentGuestCount: admin.firestore.FieldValue.increment(1),
        updatedAt: now(),
      });

      // Create custom token for Firebase Auth
      const customToken = await admin.auth().createCustomToken(sessionRef.id, {
        eventId,
        guestToken,
        role: "guest",
      });

      return {
        success: true,
        sessionId: sessionRef.id,
        guestToken,
        customToken,
        expiresAt: expiresAt.toDate().toISOString(),
      };
    } catch (error: any) {
      console.error("Error creating guest session:", error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        "internal",
        "Failed to create guest session: " + error.message
      );
    }
  });

/**
 * Validate guest session
 */
export const validateGuestSession = functions
  .region(config.app.region)
  .https.onCall(async (
    data: { sessionId: string; guestToken: string },
    context
  ) => {
    try {
      const { sessionId, guestToken } = data;

      if (!sessionId || !guestToken) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Session ID and guest token are required"
        );
      }

      // Get session
      const sessionDoc = await db.collection("guestSessions").doc(sessionId).get();

      if (!sessionDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Session not found"
        );
      }

      const session = sessionDoc.data();

      // Validate token
      if (session?.guestToken !== guestToken) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Invalid guest token"
        );
      }

      // Check expiration
      const now = admin.firestore.Timestamp.now();
      if (session?.expiresAt && session.expiresAt.toMillis() < now.toMillis()) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Session expired"
        );
      }

      // Update last access time
      await sessionDoc.ref.update({
        lastAccessAt: now,
      });

      return {
        success: true,
        eventId: session?.eventId,
        valid: true,
      };
    } catch (error: any) {
      console.error("Error validating guest session:", error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        "internal",
        "Failed to validate session"
      );
    }
  });

/**
 * Cleanup expired guest sessions
 * Runs every 6 hours
 */
export const cleanupExpiredSessions = functions
  .region(config.app.region)
  .pubsub.schedule("0 */6 * * *")
  .timeZone("Asia/Tokyo")
  .onRun(async (context) => {
    try {
      const now = admin.firestore.Timestamp.now();

      // Find expired sessions
      const expiredSessionsQuery = db
        .collection("guestSessions")
        .where("expiresAt", "<", now)
        .limit(500);

      const expiredSnapshot = await expiredSessionsQuery.get();

      if (expiredSnapshot.empty) {
        console.log("No expired sessions to clean up");
        return null;
      }

      // Delete in batches
      const batch = db.batch();
      expiredSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(`Cleaned up ${expiredSnapshot.size} expired sessions`);

      return null;
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error);
      return null;
    }
  });

/**
 * Get guest statistics for an event
 */
export const getGuestStats = functions
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
        throw new functions.https.HttpsError("not-found", "Event not found");
      }

      const event = eventDoc.data();
      if (event?.hostUserId !== userId) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "You don't have permission to view guest stats"
        );
      }

      // Get guest sessions
      const sessionsSnapshot = await db
        .collection("guestSessions")
        .where("eventId", "==", eventId)
        .get();

      // Get photo stats by guests
      const guestPhotosSnapshot = await db
        .collection("photos")
        .where("eventId", "==", eventId)
        .where("uploaderType", "==", "guest")
        .get();

      const now = admin.firestore.Timestamp.now();
      const activeSessions = sessionsSnapshot.docs.filter(
        (doc) => doc.data().expiresAt.toMillis() > now.toMillis()
      );

      return {
        success: true,
        totalGuests: sessionsSnapshot.size,
        activeGuests: activeSessions.length,
        guestPhotos: guestPhotosSnapshot.size,
        guestLimit: event?.guestLimit || 0,
        currentGuestCount: event?.currentGuestCount || 0,
      };
    } catch (error: any) {
      console.error("Error getting guest stats:", error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        "internal",
        "Failed to get guest stats"
      );
    }
  });
