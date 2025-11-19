//
//  ProfileView.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showSignOutConfirmation = false
    
    var body: some View {
        NavigationStack {
            List {
                // User Info Section
                if let user = authViewModel.currentUser {
                    Section {
                        HStack(spacing: 16) {
                            // Profile Image or Initials
                            if let photoURL = user.photoURL, let url = URL(string: photoURL) {
                                AsyncImage(url: url) { image in
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fill)
                                } placeholder: {
                                    Circle()
                                        .fill(Color.blue.gradient)
                                        .overlay {
                                            Text(user.initials)
                                                .foregroundColor(.white)
                                                .font(.title2)
                                        }
                                }
                                .frame(width: 60, height: 60)
                                .clipShape(Circle())
                            } else {
                                Circle()
                                    .fill(Color.blue.gradient)
                                    .frame(width: 60, height: 60)
                                    .overlay {
                                        Text(user.initials)
                                            .foregroundColor(.white)
                                            .font(.title2)
                                    }
                            }
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text(user.displayName)
                                    .font(.headline)
                                
                                Text(user.email)
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                
                                Text(user.provider == "apple" ? "Apple ID" : "Google")
                                    .font(.caption)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 2)
                                    .background(Color.gray.opacity(0.2))
                                    .cornerRadius(4)
                            }
                        }
                        .padding(.vertical, 8)
                    }
                }
                
                // Settings Section
                Section("設定") {
                    NavigationLink(destination: Text("通知設定")) {
                        Label("通知", systemImage: "bell")
                    }
                    
                    NavigationLink(destination: Text("プライバシー設定")) {
                        Label("プライバシー", systemImage: "lock")
                    }
                    
                    NavigationLink(destination: Text("ヘルプ")) {
                        Label("ヘルプ", systemImage: "questionmark.circle")
                    }
                }
                
                // App Info Section
                Section("アプリ情報") {
                    HStack {
                        Text("バージョン")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }
                    
                    NavigationLink(destination: Text("利用規約")) {
                        Label("利用規約", systemImage: "doc.text")
                    }
                    
                    NavigationLink(destination: Text("プライバシーポリシー")) {
                        Label("プライバシーポリシー", systemImage: "hand.raised")
                    }
                }
                
                // Sign Out Section
                Section {
                    Button(role: .destructive, action: {
                        showSignOutConfirmation = true
                    }) {
                        HStack {
                            Spacer()
                            Label("サインアウト", systemImage: "arrow.right.square")
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("設定")
            .alert("サインアウト", isPresented: $showSignOutConfirmation) {
                Button("キャンセル", role: .cancel) { }
                Button("サインアウト", role: .destructive) {
                    authViewModel.signOut()
                }
            } message: {
                Text("本当にサインアウトしますか？")
            }
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthViewModel())
}
