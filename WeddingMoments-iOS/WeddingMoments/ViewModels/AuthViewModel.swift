//
//  AuthViewModel.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import Foundation
import FirebaseAuth
import FirebaseFirestore
import AuthenticationServices
import SwiftUI

@MainActor
class AuthViewModel: ObservableObject {
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let auth = Auth.auth()
    private let db = Firestore.firestore()
    
    init() {
        checkAuthStatus()
    }
    
    func checkAuthStatus() {
        if let firebaseUser = auth.currentUser {
            isAuthenticated = true
            Task {
                await fetchUserData(userId: firebaseUser.uid)
            }
        }
    }
    
    // MARK: - Sign In with Apple
    func signInWithApple(credential: ASAuthorizationAppleIDCredential) async -> Bool {
        isLoading = true
        defer { isLoading = false }
        
        guard let idToken = credential.identityToken,
              let idTokenString = String(data: idToken, encoding: .utf8) else {
            errorMessage = "Apple IDトークンの取得に失敗しました"
            return false
        }
        
        let oauthCredential = OAuthProvider.credential(
            withProviderID: "apple.com",
            idToken: idTokenString,
            rawNonce: nil
        )
        
        do {
            let result = try await auth.signIn(with: oauthCredential)
            await createOrUpdateUser(firebaseUser: result.user, provider: "apple")
            isAuthenticated = true
            return true
        } catch {
            errorMessage = "Apple Sign Inに失敗しました: \(error.localizedDescription)"
            return false
        }
    }
    
    // MARK: - Sign In with Google (Placeholder)
    func signInWithGoogle() async -> Bool {
        // Google Sign In実装はGoogleSignIn SDKが必要
        // ここではプレースホルダーのみ
        errorMessage = "Google Sign Inは実装中です"
        return false
    }
    
    // MARK: - Sign Out
    func signOut() {
        do {
            try auth.signOut()
            currentUser = nil
            isAuthenticated = false
        } catch {
            errorMessage = "サインアウトに失敗しました: \(error.localizedDescription)"
        }
    }
    
    // MARK: - User Data Management
    private func createOrUpdateUser(firebaseUser: FirebaseAuth.User, provider: String) async {
        let userRef = db.collection("users").document(firebaseUser.uid)
        
        let userData: [String: Any] = [
            "email": firebaseUser.email ?? "",
            "displayName": firebaseUser.displayName ?? "",
            "photoURL": firebaseUser.photoURL?.absoluteString ?? "",
            "provider": provider,
            "updatedAt": FieldValue.serverTimestamp()
        ]
        
        do {
            // Check if user exists
            let document = try await userRef.getDocument()
            
            if document.exists {
                // Update existing user
                try await userRef.updateData(userData)
            } else {
                // Create new user
                var newUserData = userData
                newUserData["createdAt"] = FieldValue.serverTimestamp()
                try await userRef.setData(newUserData)
            }
            
            await fetchUserData(userId: firebaseUser.uid)
        } catch {
            errorMessage = "ユーザーデータの保存に失敗しました: \(error.localizedDescription)"
        }
    }
    
    private func fetchUserData(userId: String) async {
        do {
            let document = try await db.collection("users").document(userId).getDocument()
            if let data = document.data() {
                self.currentUser = User(
                    id: userId,
                    email: data["email"] as? String ?? "",
                    displayName: data["displayName"] as? String ?? "",
                    photoURL: data["photoURL"] as? String,
                    provider: data["provider"] as? String ?? "unknown"
                )
            }
        } catch {
            errorMessage = "ユーザーデータの取得に失敗しました: \(error.localizedDescription)"
        }
    }
}

// MARK: - User Model
struct User: Identifiable, Codable {
    var id: String
    var email: String
    var displayName: String
    var photoURL: String?
    var provider: String
    
    var initials: String {
        let components = displayName.split(separator: " ")
        if components.count >= 2 {
            return String(components[0].prefix(1) + components[1].prefix(1))
        } else if let first = components.first {
            return String(first.prefix(2))
        }
        return "?"
    }
}
