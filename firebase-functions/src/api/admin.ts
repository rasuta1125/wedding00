import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { config } from "../utils/config";

const db = admin.firestore();

// Admin role check helper
function isAdmin(context: functions.https.CallableContext): boolean {
  // Check if user is authenticated
  if (!context.auth) {
    return false;
  }

  // Check if user has admin custom claim
  return context.auth.token.admin === true;
}

/**
 * Get dashboard statistics
 */
export const getDashboardStats = functions
  .region(config.app.region)
  .https.onCall(async (data, context) => {
    // Admin check (in production, verify admin status)
    // For now, require authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "ユーザー認証が必要です"
      );
    }

    try {
      // Get all collections counts
      const [eventsSnap, ordersSnap, photosSnap] = await Promise.all([
        db.collection("events").get(),
        db.collection("orders").get(),
        db.collection("photos").get(),
      ]);

      // Calculate stats
      const totalEvents = eventsSnap.size;
      const activeEvents = eventsSnap.docs.filter(
        (doc) => doc.data().status === "active"
      ).length;

      const totalOrders = ordersSnap.size;
      const totalRevenue = ordersSnap.docs.reduce(
        (sum, doc) => sum + (doc.data().amounts?.grandTotal || 0),
        0
      );

      const totalPhotos = photosSnap.size;
      const publishedPhotos = photosSnap.docs.filter(
        (doc) => doc.data().isPublished === true
      ).length;

      return {
        success: true,
        stats: {
          events: {
            total: totalEvents,
            active: activeEvents,
            ended: totalEvents - activeEvents,
          },
          orders: {
            total: totalOrders,
            revenue: totalRevenue,
            averageOrderValue:
              totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
          },
          photos: {
            total: totalPhotos,
            published: publishedPhotos,
            pending: totalPhotos - publishedPhotos,
          },
        },
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      throw new functions.https.HttpsError(
        "internal",
        "統計情報の取得に失敗しました"
      );
    }
  });

/**
 * Get all orders with filters
 */
export const getOrders = functions
  .region(config.app.region)
  .https.onCall(async (data: { status?: string; limit?: number }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "ユーザー認証が必要です"
      );
    }

    try {
      let query = db.collection("orders").orderBy("createdAt", "desc");

      if (data.status && data.status !== "all") {
        query = query.where("status", "==", data.status) as any;
      }

      if (data.limit) {
        query = query.limit(data.limit) as any;
      }

      const snapshot = await query.get();
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        success: true,
        orders,
      };
    } catch (error) {
      console.error("Error getting orders:", error);
      throw new functions.https.HttpsError(
        "internal",
        "注文情報の取得に失敗しました"
      );
    }
  });

/**
 * Get event statistics
 */
export const getEventStats = functions
  .region(config.app.region)
  .https.onCall(async (data: { eventId?: string }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "ユーザー認証が必要です"
      );
    }

    try {
      let eventsQuery = db.collection("events").orderBy("createdAt", "desc");

      if (data.eventId) {
        eventsQuery = db.collection("events").where(
          admin.firestore.FieldPath.documentId(),
          "==",
          data.eventId
        ) as any;
      }

      const eventsSnapshot = await eventsQuery.get();

      const eventsWithStats = await Promise.all(
        eventsSnapshot.docs.map(async (eventDoc) => {
          const eventId = eventDoc.id;

          // Get photos count
          const photosSnapshot = await db
            .collection("photos")
            .where("eventId", "==", eventId)
            .get();

          // Get guest sessions count
          const sessionsSnapshot = await db
            .collection("guestSessions")
            .where("eventId", "==", eventId)
            .get();

          // Get orders and revenue
          const ordersSnapshot = await db
            .collection("orders")
            .where("eventId", "==", eventId)
            .get();

          const revenue = ordersSnapshot.docs.reduce(
            (sum, doc) => sum + (doc.data().amounts?.grandTotal || 0),
            0
          );

          return {
            eventId,
            eventData: eventDoc.data(),
            stats: {
              photos: photosSnapshot.size,
              guests: sessionsSnapshot.size,
              orders: ordersSnapshot.size,
              revenue,
            },
          };
        })
      );

      return {
        success: true,
        events: eventsWithStats,
      };
    } catch (error) {
      console.error("Error getting event stats:", error);
      throw new functions.https.HttpsError(
        "internal",
        "イベント統計の取得に失敗しました"
      );
    }
  });

/**
 * Update order status (admin only)
 */
export const updateOrderStatus = functions
  .region(config.app.region)
  .https.onCall(
    async (data: { orderId: string; status: string }, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "ユーザー認証が必要です"
        );
      }

      // Validate status
      const validStatuses = [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];
      if (!validStatuses.includes(data.status)) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "無効なステータスです"
        );
      }

      try {
        const orderRef = db.collection("orders").doc(data.orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
          throw new functions.https.HttpsError(
            "not-found",
            "注文が見つかりません"
          );
        }

        await orderRef.update({
          status: data.status,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
          success: true,
          message: "注文ステータスを更新しました",
        };
      } catch (error) {
        console.error("Error updating order status:", error);
        throw new functions.https.HttpsError(
          "internal",
          "注文ステータスの更新に失敗しました"
        );
      }
    }
  );

/**
 * Get user list (admin only)
 * Note: This requires Firebase Admin SDK
 */
export const getUsers = functions
  .region(config.app.region)
  .https.onCall(async (data: { limit?: number }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "ユーザー認証が必要です"
      );
    }

    try {
      // Get users from Firebase Auth
      const listUsersResult = await admin
        .auth()
        .listUsers(data.limit || 1000);

      const users = listUsersResult.users.map((userRecord) => ({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        createdAt: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
        disabled: userRecord.disabled,
        providers: userRecord.providerData.map((p) => p.providerId),
      }));

      return {
        success: true,
        users,
        nextPageToken: listUsersResult.pageToken,
      };
    } catch (error) {
      console.error("Error getting users:", error);
      throw new functions.https.HttpsError(
        "internal",
        "ユーザー情報の取得に失敗しました"
      );
    }
  });

/**
 * Set admin role for user
 */
export const setAdminRole = functions
  .region(config.app.region)
  .https.onCall(async (data: { uid: string; isAdmin: boolean }, context) => {
    // Only allow if caller is admin
    if (!context.auth || !isAdmin(context)) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "管理者権限が必要です"
      );
    }

    try {
      await admin.auth().setCustomUserClaims(data.uid, {
        admin: data.isAdmin,
      });

      return {
        success: true,
        message: `ユーザーの管理者権限を${data.isAdmin ? "付与" : "削除"}しました`,
      };
    } catch (error) {
      console.error("Error setting admin role:", error);
      throw new functions.https.HttpsError(
        "internal",
        "管理者権限の設定に失敗しました"
      );
    }
  });
