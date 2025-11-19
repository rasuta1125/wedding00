import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as archiver from "archiver";
import * as path from "path";
import * as fs from "fs";
import { config } from "../utils/config";

const storage = admin.storage();
const db = admin.firestore();

/**
 * Create ZIP album for download
 */
export const createAlbumZip = functions
  .region(config.app.region)
  .https.onCall(async (data: { eventId: string }, context) => {
    try {
      // Check authentication
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

      console.log(`Creating ZIP for ${photosSnapshot.size} photos`);

      // Create ZIP file
      const timestamp = Date.now();
      const zipFileName = `album_${eventId}_${timestamp}.zip`;
      const tempZipPath = `/tmp/${zipFileName}`;
      const output = fs.createWriteStream(tempZipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      // Pipe archive data to the file
      archive.pipe(output);

      const bucket = storage.bucket();

      // Download and add each photo to ZIP
      for (const photoDoc of photosSnapshot.docs) {
        const photo = photoDoc.data();
        const photoUrl = photo.originalUrl || photo.mediumUrl;

        try {
          // Extract file path from URL
          const urlParts = photoUrl.split("/");
          const bucketIndex = urlParts.findIndex((part) => part.includes("appspot.com"));
          const filePath = urlParts.slice(bucketIndex + 1).join("/");

          // Download photo
          const tempPhotoPath = `/tmp/photo_${photoDoc.id}`;
          await bucket.file(filePath).download({ destination: tempPhotoPath });

          // Add to archive with sequential naming
          const extension = path.extname(filePath);
          const photoNumber = photosSnapshot.docs.indexOf(photoDoc) + 1;
          const photoName = `photo_${String(photoNumber).padStart(3, "0")}${extension}`;

          archive.file(tempPhotoPath, { name: photoName });

          console.log(`Added photo ${photoNumber} to ZIP`);
        } catch (error) {
          console.error(`Error processing photo ${photoDoc.id}:`, error);
        }
      }

      // Finalize archive
      await archive.finalize();

      // Wait for output stream to finish
      await new Promise((resolve, reject) => {
        output.on("close", resolve);
        output.on("error", reject);
      });

      console.log(`ZIP created: ${archive.pointer()} bytes`);

      // Upload ZIP to Storage
      const zipStoragePath = `downloads/${eventId}/${zipFileName}`;
      await bucket.upload(tempZipPath, {
        destination: zipStoragePath,
        metadata: {
          contentType: "application/zip",
          metadata: {
            eventId,
            photoCount: photosSnapshot.size.toString(),
          },
        },
      });

      // Generate signed URL (valid for 1 hour)
      const [downloadUrl] = await bucket
        .file(zipStoragePath)
        .getSignedUrl({
          action: "read",
          expires: Date.now() + 60 * 60 * 1000, // 1 hour
        });

      // Cleanup temp files
      fs.unlinkSync(tempZipPath);
      photosSnapshot.docs.forEach((doc, index) => {
        const tempPath = `/tmp/photo_${doc.id}`;
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      });

      // Schedule ZIP deletion after 24 hours
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      return {
        success: true,
        downloadUrl,
        expiresAt: expiresAt.toISOString(),
        photoCount: photosSnapshot.size,
        fileSize: archive.pointer(),
      };
    } catch (error: any) {
      console.error("Error creating album ZIP:", error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        "internal",
        "Failed to create album ZIP: " + error.message
      );
    }
  });

/**
 * Cleanup expired ZIP files
 * Runs daily at 2 AM
 */
export const cleanupExpiredZips = functions
  .region(config.app.region)
  .pubsub.schedule("0 2 * * *")
  .timeZone("Asia/Tokyo")
  .onRun(async (context) => {
    try {
      const bucket = storage.bucket();
      const [files] = await bucket.getFiles({ prefix: "downloads/" });

      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;

      for (const file of files) {
        const [metadata] = await file.getMetadata();
        const createdTime = new Date(metadata.timeCreated).getTime();

        if (createdTime < oneDayAgo) {
          await file.delete();
          console.log(`Deleted expired ZIP: ${file.name}`);
        }
      }

      return null;
    } catch (error) {
      console.error("Error cleaning up expired ZIPs:", error);
      return null;
    }
  });
