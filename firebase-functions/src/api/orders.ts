import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import { CreateOrderRequest, CreateOrderResponse, Order } from "../types";
import {
  generateOrderNumber,
  calculateTax,
  calculateShipping,
  isValidEmail,
  isValidPhone,
  now,
} from "../utils/helpers";
import { sendOrderConfirmationEmail, sendShippingNotificationEmail } from "../utils/email";
import { config } from "../utils/config";

const db = admin.firestore();
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2023-10-16",
});

/**
 * Create a new order
 */
export const createOrder = functions
  .region(config.app.region)
  .https.onCall(async (data: CreateOrderRequest, context): Promise<CreateOrderResponse> => {
    try {
      // Validate input
      if (!data.eventId || !data.items || data.items.length === 0) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Event ID and items are required"
        );
      }

      // Validate shipping info
      if (!data.shippingInfo) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Shipping information is required"
        );
      }

      const { name, email, phone, postalCode, prefecture, city, address1 } =
        data.shippingInfo;

      if (!name || !email || !phone || !postalCode || !prefecture || !city || !address1) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "All shipping information fields are required"
        );
      }

      if (!isValidEmail(email)) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid email address"
        );
      }

      if (!isValidPhone(phone)) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid phone number"
        );
      }

      // Verify event exists
      const eventDoc = await db.collection("events").doc(data.eventId).get();
      if (!eventDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Event not found"
        );
      }

      // Calculate order amounts
      let subtotal = 0;
      const orderItems = [];

      for (const item of data.items) {
        // Get product details
        const productDoc = await db.collection("products").doc(item.productId).get();
        
        if (!productDoc.exists) {
          throw new functions.https.HttpsError(
            "not-found",
            `Product ${item.productId} not found`
          );
        }

        const product = productDoc.data();
        if (!product) continue;

        let itemPrice = product.basePrice;

        // Add option modifiers
        if (item.selectedOptions && product.options) {
          for (const selectedOption of item.selectedOptions) {
            const option = product.options.find(
              (opt: any) => opt.optionId === selectedOption.optionId
            );
            if (option) {
              const value = option.values.find(
                (v: any) => v.value === selectedOption.value
              );
              if (value) {
                itemPrice += value.priceModifier;
              }
            }
          }
        }

        const itemSubtotal = itemPrice * item.quantity;
        subtotal += itemSubtotal;

        orderItems.push({
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: itemPrice,
          selectedOptions: item.selectedOptions || [],
          subtotal: itemSubtotal,
        });
      }

      const tax = calculateTax(subtotal);
      const shipping = calculateShipping(subtotal);
      const total = subtotal + tax + shipping;

      // Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: "jpy",
        metadata: {
          eventId: data.eventId,
          customerEmail: email,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Generate order number
      const orderNumber = generateOrderNumber(new Date());

      // Create order document
      const orderRef = await db.collection("orders").add({
        eventId: data.eventId,
        orderNumber,
        items: orderItems,
        shippingInfo: data.shippingInfo,
        amounts: {
          subtotal,
          tax,
          shipping,
          total,
        },
        payment: {
          method: "stripe",
          stripePaymentIntentId: paymentIntent.id,
          stripeChargeId: null,
          paidAt: null,
        },
        status: "pending",
        trackingNumber: null,
        shippedAt: null,
        deliveredAt: null,
        notes: null,
        createdAt: now(),
        updatedAt: now(),
      });

      return {
        success: true,
        orderId: orderRef.id,
        clientSecret: paymentIntent.client_secret || undefined,
      };
    } catch (error: any) {
      console.error("Error creating order:", error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        "internal",
        "Failed to create order: " + error.message
      );
    }
  });

/**
 * Handle Stripe webhook events
 */
export const stripeWebhook = functions
  .region(config.app.region)
  .https.onRequest(async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"];
      
      if (!sig) {
        res.status(400).send("Missing stripe-signature header");
        return;
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.rawBody,
          sig,
          config.stripe.webhookSecret
        );
      } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      // Handle the event
      switch (event.type) {
        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await handlePaymentSuccess(paymentIntent);
          break;
        }

        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await handlePaymentFailure(paymentIntent);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error("Error processing webhook:", error);
      res.status(500).send("Webhook processing failed");
    }
  });

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Find order by PaymentIntent ID
    const ordersQuery = db
      .collection("orders")
      .where("payment.stripePaymentIntentId", "==", paymentIntent.id)
      .limit(1);

    const ordersSnapshot = await ordersQuery.get();

    if (ordersSnapshot.empty) {
      console.error("Order not found for PaymentIntent:", paymentIntent.id);
      return;
    }

    const orderDoc = ordersSnapshot.docs[0];
    const order = orderDoc.data() as Order;

    // Update order status
    await orderDoc.ref.update({
      "payment.paidAt": now(),
      "payment.stripeChargeId": paymentIntent.latest_charge,
      status: "paid",
      updatedAt: now(),
    });

    // Send confirmation email
    await sendOrderConfirmationEmail({
      ...order,
      payment: {
        ...order.payment,
        paidAt: now(),
      },
    });

    console.log(`Payment successful for order ${order.orderNumber}`);
  } catch (error) {
    console.error("Error handling payment success:", error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Find order by PaymentIntent ID
    const ordersQuery = db
      .collection("orders")
      .where("payment.stripePaymentIntentId", "==", paymentIntent.id)
      .limit(1);

    const ordersSnapshot = await ordersQuery.get();

    if (ordersSnapshot.empty) {
      console.error("Order not found for PaymentIntent:", paymentIntent.id);
      return;
    }

    const orderDoc = ordersSnapshot.docs[0];

    // Update order status
    await orderDoc.ref.update({
      status: "cancelled",
      notes: "Payment failed",
      updatedAt: now(),
    });

    console.log(`Payment failed for order ${orderDoc.id}`);
  } catch (error) {
    console.error("Error handling payment failure:", error);
    throw error;
  }
}

/**
 * Update order shipping status
 */
export const updateShippingStatus = functions
  .region(config.app.region)
  .https.onCall(async (
    data: { orderId: string; trackingNumber: string },
    context
  ) => {
    try {
      // Admin authentication check would go here
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User must be authenticated"
        );
      }

      const { orderId, trackingNumber } = data;

      if (!orderId || !trackingNumber) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Order ID and tracking number are required"
        );
      }

      const orderDoc = await db.collection("orders").doc(orderId).get();

      if (!orderDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Order not found"
        );
      }

      const order = orderDoc.data() as Order;

      // Update order
      await orderDoc.ref.update({
        status: "shipped",
        trackingNumber,
        shippedAt: now(),
        updatedAt: now(),
      });

      // Send shipping notification email
      await sendShippingNotificationEmail(order, trackingNumber);

      return { success: true };
    } catch (error: any) {
      console.error("Error updating shipping status:", error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        "internal",
        "Failed to update shipping status"
      );
    }
  });
