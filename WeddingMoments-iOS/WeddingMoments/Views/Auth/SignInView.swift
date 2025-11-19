//
//  SignInView.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import SwiftUI
import AuthenticationServices

struct SignInView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showError = false
    
    var body: some View {
        VStack(spacing: 30) {
            Spacer()
            
            // App Logo & Title
            VStack(spacing: 16) {
                Image(systemName: "heart.circle.fill")
                    .font(.system(size: 80))
                    .foregroundStyle(.pink.gradient)
                
                Text("WeddingMoments")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("結婚式の思い出を共有しよう")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            // Sign In Buttons
            VStack(spacing: 16) {
                SignInWithAppleButton(.signIn) { request in
                    request.requestedScopes = [.fullName, .email]
                } onCompletion: { result in
                    switch result {
                    case .success(let authorization):
                        if let credential = authorization.credential as? ASAuthorizationAppleIDCredential {
                            Task {
                                let success = await authViewModel.signInWithApple(credential: credential)
                                if !success {
                                    showError = true
                                }
                            }
                        }
                    case .failure(let error):
                        print("Apple Sign In failed: \(error.localizedDescription)")
                        showError = true
                    }
                }
                .signInWithAppleButtonStyle(.black)
                .frame(height: 50)
                
                Button(action: {
                    Task {
                        await authViewModel.signInWithGoogle()
                    }
                }) {
                    HStack {
                        Image(systemName: "globe")
                        Text("Googleでサインイン")
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
            }
            .padding(.horizontal)
            
            Spacer()
            
            // Terms & Privacy
            VStack(spacing: 8) {
                Text("続けることで、利用規約とプライバシーポリシーに")
                    .font(.caption2)
                Text("同意したものとみなされます")
                    .font(.caption2)
            }
            .foregroundColor(.secondary)
            .padding(.bottom, 30)
        }
        .padding()
        .alert("サインインエラー", isPresented: $showError) {
            Button("OK") { }
        } message: {
            Text(authViewModel.errorMessage ?? "サインインに失敗しました")
        }
        .overlay {
            if authViewModel.isLoading {
                ProgressView()
                    .scaleEffect(1.5)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color.black.opacity(0.2))
            }
        }
    }
}

#Preview {
    SignInView()
        .environmentObject(AuthViewModel())
}
