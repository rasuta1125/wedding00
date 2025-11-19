//
//  WeddingMomentsApp.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import SwiftUI
import FirebaseCore
import StripePaymentSheet

@main
struct WeddingMomentsApp: App {
    @StateObject private var authViewModel = AuthViewModel()
    
    init() {
        // Configure Firebase
        FirebaseApp.configure()
        
        // Configure Stripe
        StripeAPI.defaultPublishableKey = Config.Stripe.publishableKey
        
        // Validate configuration
        let (isValid, errors) = Config.validateConfiguration()
        if !isValid {
            print("⚠️ Configuration Warnings:")
            errors.forEach { print("  - \($0)") }
        }
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authViewModel)
        }
    }
}
