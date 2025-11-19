import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as sharp from "sharp";
import * as path from "path";
import { config } from "../utils/config";

const storage = admin.storage();
const db = admin.firestore();

/**
 * Generate thumbnails when a photo is uploaded
 * Triggered by Storage upload
 */
export const generateThumbnails = functions
  .region(config.app.region)
  .storage.object()
  .onFinalize(async (object) => {
    try {
      const filePath = object.name;
      const contentType = object.contentType;

      // Only process images
      if (!contentType || !contentType.startsWith("image/")) {
        console.log("Not an image, skipping:", filePath);
        return null;
      }

      // Skip if already a thumbnail or medium
      if (!filePath || filePath.includes("/thumbnails/") || filePath.includes("/medium/")) {
        console.log("Already a processed image, skipping:", filePath);
        return null;
      }

      // Only process photos in events/{eventId}/photos/
      if (!filePath.match(/^events\/[^/]+\/photos\//)) {
        console.log("Not in events/photos directory, skipping:", filePath);
        return null;
      }

      const bucket = storage.bucket(object.bucket);
      const fileName = path.basename(filePath);
      const fileDir = path.dirname(filePath);

      // Download original image
      const tempFilePath = `/tmp/${fileName}`;
      await bucket.file(filePath).download({ destination: tempFilePath });

      console.log("Downloaded image to:", tempFilePath);

      // Generate thumbnail (200x200)
      const thumbnailFileName = `thumb_200x200_${fileName}`;
      const thumbnailPath = path.join(fileDir, "thumbnails", thumbnailFileName);
      const thumbnailTempPath = `/tmp/${thumbnailFileName}`;

      await sharp(tempFilePath)
        .resize(200, 200, {
          fit: "cover",
          position: "center",
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailTempPath);

      await bucket.upload(thumbnailTempPath, {
        destination: thumbnailPath,
        metadata: {
          contentType: "image/jpeg",
          metadata: {
            originalImage: filePath,
          },
        },
      });

      console.log("Thumbnail created at:", thumbnailPath);

      // Generate medium size (800x800)
      const mediumFileName = `medium_800x800_${fileName}`;
      const mediumPath = path.join(fileDir, "medium", mediumFileName);
      const mediumTempPath = `/tmp/${mediumFileName}`;

      await sharp(tempFilePath)
        .resize(800, 800, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toFile(mediumTempPath);

      await bucket.upload(mediumTempPath, {
        destination: mediumPath,
        metadata: {
          contentType: "image/jpeg",
          metadata: {
            originalImage: filePath,
          },
        },
      });

      console.log("Medium size created at:", mediumPath);

      // Update Firestore with thumbnail URLs
      const originalUrl = `https://storage.googleapis.com/${object.bucket}/${filePath}`;
      const thumbnailUrl = `https://storage.googleapis.com/${object.bucket}/${thumbnailPath}`;
      const mediumUrl = `https://storage.googleapis.com/${object.bucket}/${mediumPath}`;

      // Find photo document by originalUrl
      const photosQuery = db
        .collection("photos")
        .where("originalUrl", "==", originalUrl)
        .limit(1);

      const photosSnapshot = await photosQuery.get();

      if (!photosSnapshot.empty) {
        const photoDoc = photosSnapshot.docs[0];
        await photoDoc.ref.update({
          thumbnailUrl,
          mediumUrl,
        });
        console.log("Updated photo document with thumbnail URLs");
      } else {
        console.log("Photo document not found for URL:", originalUrl);
      }

      // Cleanup temp files
      const fs = require("fs");
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      if (fs.existsSync(thumbnailTempPath)) fs.unlinkSync(thumbnailTempPath);
      if (fs.existsSync(mediumTempPath)) fs.unlinkSync(mediumTempPath);

      return null;
    } catch (error) {
      console.error("Error generating thumbnails:", error);
      return null;
    }
  });

/**
 * Delete associated thumbnails when original photo is deleted
 */
export const cleanupThumbnails = functions
  .region(config.app.region)
  .storage.object()
  .onDelete(async (object) => {
    try {
      const filePath = object.name;

      if (!filePath) return null;

      // Only process original photos
      if (filePath.includes("/thumbnails/") || filePath.includes("/medium/")) {
        return null;
      }

      // Only process photos in events/{eventId}/photos/
      if (!filePath.match(/^events\/[^/]+\/photos\//)) {
        return null;
      }

      const bucket = storage.bucket(object.bucket);
      const fileName = path.basename(filePath);
      const fileDir = path.dirname(filePath);

      // Delete thumbnail
      const thumbnailPath = path.join(fileDir, "thumbnails", `thumb_200x200_${fileName}`);
      try {
        await bucket.file(thumbnailPath).delete();
        console.log("Deleted thumbnail:", thumbnailPath);
      } catch (error) {
        console.log("Thumbnail not found:", thumbnailPath);
      }

      // Delete medium size
      const mediumPath = path.join(fileDir, "medium", `medium_800x800_${fileName}`);
      try {
        await bucket.file(mediumPath).delete();
        console.log("Deleted medium:", mediumPath);
      } catch (error) {
        console.log("Medium size not found:", mediumPath);
      }

      return null;
    } catch (error) {
      console.error("Error cleaning up thumbnails:", error);
      return null;
    }
  });

/**
 * Get image metadata
 */
export const getImageMetadata = async (filePath: string) => {
  try {
    const bucket = storage.bucket();
    const tempFilePath = `/tmp/${path.basename(filePath)}`;

    await bucket.file(filePath).download({ destination: tempFilePath });

    const metadata = await sharp(tempFilePath).metadata();

    // Cleanup
    const fs = require("fs");
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || "unknown",
      size: metadata.size || 0,
    };
  } catch (error) {
    console.error("Error getting image metadata:", error);
    return {
      width: 0,
      height: 0,
      format: "unknown",
      size: 0,
    };
  }
};
