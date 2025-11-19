//
//  ErrorHandler.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import Foundation
import SwiftUI

// MARK: - App Error Types
enum AppError: LocalizedError {
    case network(String)
    case authentication(String)
    case firebase(String)
    case validation(String)
    case stripe(String)
    case unknown(String)
    
    var errorDescription: String? {
        switch self {
        case .network(let message):
            return "ネットワークエラー: \(message)"
        case .authentication(let message):
            return "認証エラー: \(message)"
        case .firebase(let message):
            return "サーバーエラー: \(message)"
        case .validation(let message):
            return "入力エラー: \(message)"
        case .stripe(let message):
            return "決済エラー: \(message)"
        case .unknown(let message):
            return "エラー: \(message)"
        }
    }
    
    var recoveryMessage: String {
        switch self {
        case .network:
            return "インターネット接続を確認してください。"
        case .authentication:
            return "もう一度ログインしてください。"
        case .firebase:
            return "しばらくしてから再度お試しください。"
        case .validation:
            return "入力内容を確認してください。"
        case .stripe:
            return "支払い情報を確認してください。"
        case .unknown:
            return "問題が解決しない場合はサポートにお問い合わせください。"
        }
    }
}

// MARK: - Error Alert Modifier
struct ErrorAlert: ViewModifier {
    @Binding var error: Error?
    
    func body(content: Content) -> some View {
        content
            .alert("エラーが発生しました", isPresented: .constant(error != nil)) {
                Button("OK") {
                    error = nil
                }
            } message: {
                if let error = error {
                    if let appError = error as? AppError {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(appError.localizedDescription)
                            Text(appError.recoveryMessage)
                                .font(.caption)
                        }
                    } else {
                        Text(error.localizedDescription)
                    }
                }
            }
    }
}

extension View {
    func errorAlert(error: Binding<Error?>) -> some View {
        modifier(ErrorAlert(error: error))
    }
}

// MARK: - Error Message Converter
struct ErrorMessageConverter {
    static func convert(_ error: Error) -> AppError {
        let nsError = error as NSError
        
        // Network errors
        if nsError.domain == NSURLErrorDomain {
            switch nsError.code {
            case NSURLErrorNotConnectedToInternet:
                return .network("インターネット接続がありません")
            case NSURLErrorTimedOut:
                return .network("接続がタイムアウトしました")
            case NSURLErrorCannotFindHost:
                return .network("サーバーに接続できません")
            default:
                return .network("通信エラーが発生しました")
            }
        }
        
        // Firebase errors
        if nsError.domain == "FIRAuthErrorDomain" {
            switch nsError.code {
            case 17005: // Invalid email
                return .authentication("メールアドレスの形式が正しくありません")
            case 17008: // Invalid password
                return .authentication("パスワードが正しくありません")
            case 17011: // User not found
                return .authentication("ユーザーが見つかりません")
            case 17026: // Weak password
                return .authentication("パスワードが弱すぎます")
            case 17007: // Email already in use
                return .authentication("このメールアドレスは既に使用されています")
            default:
                return .authentication("認証に失敗しました")
            }
        }
        
        if nsError.domain == "FIRFirestoreErrorDomain" {
            return .firebase("データの取得に失敗しました")
        }
        
        // Stripe errors
        if error.localizedDescription.contains("Stripe") {
            return .stripe("決済処理に失敗しました")
        }
        
        return .unknown(error.localizedDescription)
    }
}

// MARK: - Retry Handler
class RetryHandler: ObservableObject {
    @Published var isRetrying = false
    @Published var retryCount = 0
    
    private let maxRetries: Int
    private let retryDelay: TimeInterval
    
    init(maxRetries: Int = 3, retryDelay: TimeInterval = 2.0) {
        self.maxRetries = maxRetries
        self.retryDelay = retryDelay
    }
    
    func retry<T>(operation: @escaping () async throws -> T) async throws -> T {
        var lastError: Error?
        
        for attempt in 0..<maxRetries {
            do {
                retryCount = attempt + 1
                isRetrying = true
                
                let result = try await operation()
                
                // Success - reset counters
                isRetrying = false
                retryCount = 0
                
                return result
            } catch {
                lastError = error
                
                // If not last attempt, wait before retry
                if attempt < maxRetries - 1 {
                    try await Task.sleep(nanoseconds: UInt64(retryDelay * 1_000_000_000))
                }
            }
        }
        
        isRetrying = false
        retryCount = 0
        
        // All attempts failed
        throw lastError ?? AppError.unknown("リトライに失敗しました")
    }
    
    func reset() {
        isRetrying = false
        retryCount = 0
    }
}

// MARK: - Error Logging
class ErrorLogger {
    static let shared = ErrorLogger()
    
    private init() {}
    
    func log(_ error: Error, context: String? = nil) {
        let timestamp = Date()
        let appError = ErrorMessageConverter.convert(error)
        
        #if DEBUG
        print("❌ Error logged at \(timestamp)")
        if let context = context {
            print("   Context: \(context)")
        }
        print("   Type: \(appError)")
        print("   Description: \(appError.localizedDescription)")
        print("   Recovery: \(appError.recoveryMessage)")
        print("   Original: \(error)")
        #endif
        
        // In production, send to analytics service
        // Analytics.logError(error: error, context: context)
    }
}
