import * as sgMail from "@sendgrid/mail";
import { config } from "./config";
import { Order } from "../types";

// Initialize SendGrid
sgMail.setApiKey(config.sendgrid.apiKey);

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (
  order: Order
): Promise<void> => {
  try {
    const itemsHtml = order.items
      .map(
        (item) => `
        <tr>
          <td>${item.productName}</td>
          <td>${item.quantity}</td>
          <td>¥${item.subtotal.toLocaleString()}</td>
        </tr>
      `
      )
      .join("");

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>ご注文ありがとうございます</h2>
        
        <p>注文番号: <strong>${order.orderNumber}</strong></p>
        
        <h3>注文内容</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left;">商品名</th>
              <th style="padding: 10px; text-align: left;">数量</th>
              <th style="padding: 10px; text-align: left;">金額</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa;">
          <p><strong>小計:</strong> ¥${order.amounts.subtotal.toLocaleString()}</p>
          <p><strong>消費税:</strong> ¥${order.amounts.tax.toLocaleString()}</p>
          <p><strong>送料:</strong> ¥${order.amounts.shipping.toLocaleString()}</p>
          <hr>
          <p style="font-size: 18px;"><strong>合計:</strong> ¥${order.amounts.total.toLocaleString()}</p>
        </div>
        
        <h3>配送先</h3>
        <p>
          ${order.shippingInfo.name}<br>
          ${order.shippingInfo.postalCode}<br>
          ${order.shippingInfo.prefecture} ${order.shippingInfo.city}<br>
          ${order.shippingInfo.address1}<br>
          ${order.shippingInfo.address2 || ""}
        </p>
        
        <p style="margin-top: 30px; color: #666;">
          商品の発送まで3-5営業日お待ちください。<br>
          発送完了後、追跡番号をお知らせします。
        </p>
        
        <p style="color: #999; font-size: 12px;">
          このメールは自動送信されています。<br>
          お問い合わせは support@weddingmoments.app までご連絡ください。
        </p>
      </div>
    `;

    const msg = {
      to: order.shippingInfo.email,
      from: config.sendgrid.fromEmail,
      subject: `【WeddingMoments】ご注文ありがとうございます（注文番号: ${order.orderNumber}）`,
      html,
    };

    await sgMail.send(msg);
    console.log(`Order confirmation email sent to ${order.shippingInfo.email}`);
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    throw error;
  }
};

/**
 * Send shipping notification email
 */
export const sendShippingNotificationEmail = async (
  order: Order,
  trackingNumber: string
): Promise<void> => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>商品を発送しました</h2>
        
        <p>注文番号: <strong>${order.orderNumber}</strong></p>
        
        <p>お待たせいたしました。ご注文の商品を発送いたしました。</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa;">
          <p><strong>追跡番号:</strong> ${trackingNumber}</p>
          <p>配送業者の追跡サービスで配送状況をご確認いただけます。</p>
        </div>
        
        <h3>配送先</h3>
        <p>
          ${order.shippingInfo.name}<br>
          ${order.shippingInfo.postalCode}<br>
          ${order.shippingInfo.prefecture} ${order.shippingInfo.city}<br>
          ${order.shippingInfo.address1}<br>
          ${order.shippingInfo.address2 || ""}
        </p>
        
        <p style="margin-top: 30px; color: #666;">
          通常2-3日でお届け予定です。<br>
          商品到着まで今しばらくお待ちください。
        </p>
        
        <p style="color: #999; font-size: 12px;">
          このメールは自動送信されています。<br>
          お問い合わせは support@weddingmoments.app までご連絡ください。
        </p>
      </div>
    `;

    const msg = {
      to: order.shippingInfo.email,
      from: config.sendgrid.fromEmail,
      subject: `【WeddingMoments】商品を発送しました（追跡番号: ${trackingNumber}）`,
      html,
    };

    await sgMail.send(msg);
    console.log(`Shipping notification email sent to ${order.shippingInfo.email}`);
  } catch (error) {
    console.error("Error sending shipping notification email:", error);
    throw error;
  }
};

/**
 * Send photo published notification email
 */
export const sendPhotoPublishedEmail = async (
  email: string,
  eventName: string,
  eventId: string
): Promise<void> => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>写真が公開されました</h2>
        
        <p>こんにちは！</p>
        
        <p>「<strong>${eventName}</strong>」の写真が公開されました。</p>
        
        <p>下記のリンクから写真をご覧いただけます。</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${config.app.webUrl}/join/${eventId}" 
             style="display: inline-block; padding: 15px 30px; background-color: #ec4899; color: white; text-decoration: none; border-radius: 8px;">
            写真を見る
          </a>
        </div>
        
        <p style="color: #666;">
          素敵な思い出をお楽しみください！
        </p>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          このメールは自動送信されています。<br>
          お問い合わせは support@weddingmoments.app までご連絡ください。
        </p>
      </div>
    `;

    const msg = {
      to: email,
      from: config.sendgrid.fromEmail,
      subject: `【WeddingMoments】${eventName} の写真が公開されました`,
      html,
    };

    await sgMail.send(msg);
    console.log(`Photo published email sent to ${email}`);
  } catch (error) {
    console.error("Error sending photo published email:", error);
    throw error;
  }
};
