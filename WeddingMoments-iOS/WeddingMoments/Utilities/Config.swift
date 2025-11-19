//
//  Config.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import Foundation

enum Config {
    // MARK: - Stripe Configuration
    enum Stripe {
        /// Stripe Publishable Key
        /// Get from: https://dashboard.stripe.com/apikeys
        /// - Use test key (pk_test_...) for development
        /// - Use live key (pk_live_...) for production
        static let publishableKey: String = {
            // TODO: Replace with your actual key or use Info.plist
            #if DEBUG
            return "pk_test_YOUR_TEST_KEY"
            #else
            return "pk_live_YOUR_LIVE_KEY"
            #endif
        }()
        
        static let merchantDisplayName = "WeddingMoments"
    }
    
    // MARK: - App Configuration
    enum App {
        static let name = "WeddingMoments"
        static let version = "1.0.0"
        static let buildNumber = "1"
    }
    
    // MARK: - Firebase Configuration
    enum Firebase {
        static let region = "asia-northeast1"
    }
    
    // MARK: - Feature Flags
    enum Features {
        static let enableAnalytics = true
        static let enableCrashReporting = true
        static let enablePerformanceMonitoring = true
    }
    
    // MARK: - UI Configuration
    enum UI {
        static let primaryColor = "Pink"
        static let maxPhotoUploadSize = 10_000_000 // 10MB
        static let thumbnailSize: CGFloat = 200
        static let photoGridColumns = 3
    }
    
    // MARK: - Validation
    enum Validation {
        static let minPasswordLength = 8
        static let maxEventNameLength = 100
        static let maxPhotoPerUpload = 10
    }
}

// MARK: - Helper Extension
extension Config {
    /// Checks if all required configurations are set
    static func validateConfiguration() -> (isValid: Bool, errors: [String]) {
        var errors: [String] = []
        
        // Check Stripe key
        if Stripe.publishableKey.contains("YOUR_") {
            errors.append("Stripe publishable key not configured")
        }
        
        return (errors.isEmpty, errors)
    }
}
