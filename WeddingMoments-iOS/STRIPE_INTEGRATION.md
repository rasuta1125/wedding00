# Stripe SDK Integration Guide

## Overview
This document explains how to integrate the Stripe iOS SDK into the WeddingMoments iOS app.

## Dependencies

### Stripe iOS SDK
- **Package**: `stripe/stripe-ios`
- **Repository**: https://github.com/stripe/stripe-ios
- **Version**: 23.0.0 or later
- **Product**: `StripePaymentSheet`

## Installation Steps

### 1. Add Package via Xcode

1. Open the WeddingMoments.xcodeproj in Xcode
2. Go to **File > Add Package Dependencies...**
3. Enter the repository URL: `https://github.com/stripe/stripe-ios`
4. Select the version: **23.0.0** or **Up to Next Major Version**
5. Add the following product to your target:
   - `StripePaymentSheet`

### 2. Update Info.plist

Add the following keys to support Stripe features:

```xml
<key>NSCameraUsageDescription</key>
<string>カメラを使用してカード情報をスキャンします</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>写真ライブラリからカード画像を選択します</string>
```

### 3. Configure Stripe API Key

In your app's configuration or environment setup, ensure you have:

```swift
// Set in WeddingMomentsApp.swift or AppDelegate
import StripePaymentSheet

// Configure Stripe with your publishable key
STPAPIClient.shared.publishableKey = "pk_test_..." // Your Stripe publishable key
```

## Implementation

### Files Created

1. **Services/StripeService.swift**
   - Manages Stripe Payment Sheet lifecycle
   - Handles payment processing
   - Provides async/await interface

2. **Views/Shop/CheckoutView.swift** (Updated)
   - Integrated Stripe payment flow
   - Shows loading states
   - Handles success/error alerts

3. **Views/Shop/OrderSuccessView.swift**
   - Order confirmation screen
   - Shows order details and steps
   - Provides user-friendly completion flow

### Payment Flow

```
1. User fills checkout form
   ↓
2. Create order via Firebase Function
   ↓ (returns clientSecret)
3. Initialize Stripe Payment Sheet
   ↓
4. Present Payment Sheet to user
   ↓
5. User enters payment details
   ↓
6. Stripe processes payment
   ↓
7. Show success/error message
   ↓
8. Clear cart and dismiss on success
```

### Key Features

- **Japanese Locale Support**: Payment sheet configured for Japanese users
- **Custom Appearance**: Pink theme matching app design
- **Error Handling**: Comprehensive error messages in Japanese
- **Loading States**: Visual feedback during processing
- **Success Flow**: Confirmation screen with order details

## Testing

### Test Cards

Use Stripe's test cards for development:

| Card Number | Brand | Result |
|------------|-------|--------|
| 4242 4242 4242 4242 | Visa | Success |
| 4000 0000 0000 9995 | Visa | Decline |
| 4000 0025 0000 3155 | Visa | 3D Secure |

### Test Mode Configuration

1. Use test API keys from Stripe Dashboard
2. Ensure Firebase Functions use test keys in `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_test_...
   ```

## Security Best Practices

1. **Never expose Secret Key**: Only use in backend (Firebase Functions)
2. **Publishable Key**: Safe to use in iOS app
3. **Webhook Verification**: Always verify webhook signatures
4. **HTTPS Only**: All API calls go through HTTPS

## Troubleshooting

### Payment Sheet Not Showing

- Check that `clientSecret` is valid
- Ensure Stripe publishable key is set
- Verify internet connection

### Payment Fails

- Check Stripe Dashboard logs
- Verify webhook endpoint is accessible
- Check Firebase Functions logs

### Build Errors

- Ensure Stripe SDK is properly added via SPM
- Clean build folder: **Product > Clean Build Folder**
- Update to latest Xcode version

## Resources

- [Stripe iOS SDK Documentation](https://stripe.com/docs/payments/accept-a-payment?platform=ios)
- [Stripe Payment Sheet Guide](https://stripe.com/docs/payments/payment-sheet/ios)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Firebase Functions with Stripe](https://firebase.google.com/docs/functions/use-cases#stripe)

## API Reference

### StripeService

```swift
@MainActor
class StripeService: ObservableObject {
    // Initialize payment sheet with client secret
    func preparePaymentSheet(clientSecret: String, merchantDisplayName: String) async -> Bool
    
    // Present payment sheet to user
    func presentPaymentSheet() async -> PaymentSheetResult
    
    // Handle payment result
    func handlePaymentResult(_ result: PaymentSheetResult) -> (success: Bool, message: String)
    
    // Reset service state
    func reset()
}
```

### Usage Example

```swift
let stripeService = StripeService()

// 1. Get client secret from backend
let clientSecret = await createOrder()

// 2. Prepare payment sheet
let prepared = await stripeService.preparePaymentSheet(
    clientSecret: clientSecret,
    merchantDisplayName: "WeddingMoments"
)

// 3. Present to user
let result = await stripeService.presentPaymentSheet()

// 4. Handle result
let (success, message) = stripeService.handlePaymentResult(result)
```

## Production Checklist

- [ ] Replace test API keys with production keys
- [ ] Update Firebase Functions environment variables
- [ ] Configure production webhook endpoint
- [ ] Test with real payment methods
- [ ] Enable 3D Secure for required regions
- [ ] Set up proper error monitoring
- [ ] Configure payment receipt emails
- [ ] Test refund flow
- [ ] Verify tax calculations
- [ ] Test in production environment

## Support

For issues or questions:
- Check Stripe Dashboard for payment logs
- Review Firebase Functions logs
- Consult Stripe iOS SDK documentation
- Contact Stripe support for payment issues
