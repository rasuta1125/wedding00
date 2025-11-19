// Configuration and environment variables

export const config = {
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || "",
    fromEmail: process.env.SENDGRID_FROM_EMAIL || "noreply@weddingmoments.app",
  },
  app: {
    webUrl: process.env.WEB_APP_URL || "https://weddingmoments.app",
    region: process.env.REGION || "asia-northeast1",
  },
  storage: {
    bucket: process.env.STORAGE_BUCKET || "",
  },
};

export const validateConfig = () => {
  const required = [
    { key: "STRIPE_SECRET_KEY", value: config.stripe.secretKey },
    { key: "SENDGRID_API_KEY", value: config.sendgrid.apiKey },
  ];

  const missing = required.filter((item) => !item.value);
  
  if (missing.length > 0) {
    console.warn(
      "Missing environment variables:",
      missing.map((item) => item.key).join(", ")
    );
  }
};
