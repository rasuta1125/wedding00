import * as QRCode from "qrcode";
import * as admin from "firebase-admin";

/**
 * Generate QR code and upload to Firebase Storage
 */
export const generateAndUploadQRCode = async (
  eventId: string,
  qrToken: string,
  webUrl: string
): Promise<string> => {
  try {
    // Generate guest join URL
    const guestUrl = `${webUrl}/join/${eventId}?token=${qrToken}`;
    
    // Generate QR code as buffer
    const qrCodeBuffer = await QRCode.toBuffer(guestUrl, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 500,
      margin: 2,
    });
    
    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const filename = `qrcodes/qr_${eventId}.png`;
    const file = bucket.file(filename);
    
    await file.save(qrCodeBuffer, {
      metadata: {
        contentType: "image/png",
      },
      public: true,
    });
    
    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    
    return publicUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
};
