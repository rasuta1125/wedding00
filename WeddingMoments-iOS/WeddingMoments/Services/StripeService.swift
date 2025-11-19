//
//  StripeService.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import Foundation
import StripePaymentSheet

@MainActor
class StripeService: ObservableObject {
    @Published var paymentSheet: PaymentSheet?
    @Published var paymentResult: PaymentSheetResult?
    @Published var isProcessing = false
    @Published var errorMessage: String?
    
    // MARK: - Initialize Payment Sheet
    func preparePaymentSheet(clientSecret: String, merchantDisplayName: String = "WeddingMoments") async -> Bool {
        isProcessing = true
        defer { isProcessing = false }
        
        // Configure Payment Sheet
        var configuration = PaymentSheet.Configuration()
        configuration.merchantDisplayName = merchantDisplayName
        configuration.allowsDelayedPaymentMethods = false
        
        // Appearance customization
        var appearance = PaymentSheet.Appearance()
        appearance.colors.primary = .systemPink
        appearance.colors.background = .systemBackground
        appearance.colors.componentBackground = .secondarySystemBackground
        appearance.font.sizeScaleFactor = 1.0
        appearance.cornerRadius = 12.0
        configuration.appearance = appearance
        
        // Support Japanese locale
        configuration.defaultBillingDetails.name = ""
        configuration.defaultBillingDetails.email = ""
        configuration.defaultBillingDetails.phone = ""
        
        // Create Payment Sheet
        paymentSheet = PaymentSheet(
            paymentIntentClientSecret: clientSecret,
            configuration: configuration
        )
        
        return paymentSheet != nil
    }
    
    // MARK: - Present Payment Sheet
    func presentPaymentSheet() async -> PaymentSheetResult {
        guard let paymentSheet = paymentSheet else {
            errorMessage = "Payment Sheetの初期化に失敗しました"
            return .failed(error: NSError(
                domain: "StripeService",
                code: -1,
                userInfo: [NSLocalizedDescriptionKey: "Payment Sheet not initialized"]
            ))
        }
        
        return await withCheckedContinuation { continuation in
            // Present payment sheet on main thread
            DispatchQueue.main.async { [weak self] in
                guard let self = self else {
                    continuation.resume(returning: .failed(error: NSError(
                        domain: "StripeService",
                        code: -1,
                        userInfo: [NSLocalizedDescriptionKey: "Service deallocated"]
                    )))
                    return
                }
                
                // Get the root view controller
                guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                      let rootViewController = windowScene.windows.first?.rootViewController else {
                    self.errorMessage = "View Controllerの取得に失敗しました"
                    continuation.resume(returning: .failed(error: NSError(
                        domain: "StripeService",
                        code: -1,
                        userInfo: [NSLocalizedDescriptionKey: "Cannot get root view controller"]
                    )))
                    return
                }
                
                // Find the topmost view controller
                var topController = rootViewController
                while let presentedViewController = topController.presentedViewController {
                    topController = presentedViewController
                }
                
                // Present payment sheet
                paymentSheet.present(from: topController) { [weak self] result in
                    self?.paymentResult = result
                    continuation.resume(returning: result)
                }
            }
        }
    }
    
    // MARK: - Handle Payment Result
    func handlePaymentResult(_ result: PaymentSheetResult) -> (success: Bool, message: String) {
        switch result {
        case .completed:
            return (true, "お支払いが完了しました")
            
        case .canceled:
            errorMessage = "お支払いがキャンセルされました"
            return (false, "お支払いがキャンセルされました")
            
        case .failed(let error):
            let message = "お支払いに失敗しました: \(error.localizedDescription)"
            errorMessage = message
            return (false, message)
        }
    }
    
    // MARK: - Reset
    func reset() {
        paymentSheet = nil
        paymentResult = nil
        isProcessing = false
        errorMessage = nil
    }
}
