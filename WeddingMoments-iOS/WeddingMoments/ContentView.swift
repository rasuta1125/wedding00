//
//  ContentView.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    
    var body: some View {
        Group {
            if authViewModel.isAuthenticated {
                MainTabView()
            } else {
                SignInView()
            }
        }
    }
}

struct MainTabView: View {
    var body: some View {
        TabView {
            EventListView()
                .tabItem {
                    Label("イベント", systemImage: "calendar")
                }
            
            PhotoGridView()
                .tabItem {
                    Label("写真", systemImage: "photo.on.rectangle")
                }
            
            ProductListView()
                .tabItem {
                    Label("グッズ", systemImage: "cart")
                }
            
            ProfileView()
                .tabItem {
                    Label("設定", systemImage: "person.circle")
                }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthViewModel())
}
