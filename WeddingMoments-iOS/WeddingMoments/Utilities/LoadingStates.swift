//
//  LoadingStates.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import SwiftUI

// MARK: - Loading View
struct LoadingView: View {
    var message: String = "読み込み中..."
    
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)
            
            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
    }
}

// MARK: - Full Screen Loading
struct FullScreenLoadingView: View {
    var message: String = "処理中..."
    
    var body: some View {
        ZStack {
            Color.black.opacity(0.3)
                .ignoresSafeArea()
            
            VStack(spacing: 20) {
                ProgressView()
                    .scaleEffect(1.5)
                    .tint(.white)
                
                Text(message)
                    .font(.subheadline)
                    .foregroundColor(.white)
            }
            .padding(32)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(.systemGray6))
            )
        }
    }
}

// MARK: - Inline Spinner
struct InlineSpinner: View {
    var size: CGFloat = 20
    
    var body: some View {
        ProgressView()
            .scaleEffect(size / 20)
            .frame(width: size, height: size)
    }
}

// MARK: - Button Loading State
struct LoadingButton: View {
    var title: String
    var isLoading: Bool
    var action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(0.8)
                }
                
                Text(title)
                    .opacity(isLoading ? 0.6 : 1.0)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.pink)
            .foregroundColor(.white)
            .cornerRadius(12)
        }
        .disabled(isLoading)
    }
}

// MARK: - Skeleton Views
struct SkeletonView: View {
    @State private var isAnimating = false
    
    var body: some View {
        Rectangle()
            .fill(
                LinearGradient(
                    gradient: Gradient(colors: [Color.gray.opacity(0.3), Color.gray.opacity(0.15), Color.gray.opacity(0.3)]),
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .mask(
                Rectangle()
                    .offset(x: isAnimating ? 300 : -300)
            )
            .onAppear {
                withAnimation(Animation.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                    isAnimating = true
                }
            }
    }
}

struct CardSkeletonView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            SkeletonView()
                .frame(height: 20)
                .frame(maxWidth: 120)
            
            SkeletonView()
                .frame(height: 40)
                .frame(maxWidth: 200)
            
            SkeletonView()
                .frame(height: 16)
                .frame(maxWidth: 150)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
}

struct ListSkeletonView: View {
    var count: Int = 5
    
    var body: some View {
        VStack(spacing: 12) {
            ForEach(0..<count, id: \.self) { _ in
                HStack(spacing: 12) {
                    SkeletonView()
                        .frame(width: 50, height: 50)
                        .cornerRadius(8)
                    
                    VStack(alignment: .leading, spacing: 8) {
                        SkeletonView()
                            .frame(height: 16)
                            .frame(maxWidth: 200)
                        
                        SkeletonView()
                            .frame(height: 12)
                            .frame(maxWidth: 150)
                    }
                    
                    Spacer()
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
            }
        }
    }
}

struct PhotoGridSkeletonView: View {
    var columns: Int = 3
    var count: Int = 9
    
    var body: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: columns), spacing: 8) {
            ForEach(0..<count, id: \.self) { _ in
                SkeletonView()
                    .aspectRatio(1, contentMode: .fill)
                    .cornerRadius(8)
            }
        }
    }
}

// MARK: - Empty State View
struct EmptyStateView: View {
    var icon: String
    var title: String
    var message: String
    var actionTitle: String?
    var action: (() -> Void)?
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: icon)
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            VStack(spacing: 8) {
                Text(title)
                    .font(.title3)
                    .fontWeight(.bold)
                
                Text(message)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }
            
            if let actionTitle = actionTitle, let action = action {
                Button(action: action) {
                    Text(actionTitle)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 32)
                        .padding(.vertical, 12)
                        .background(Color.pink)
                        .cornerRadius(25)
                }
                .padding(.top, 8)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
    }
}

// MARK: - Progress View with Percentage
struct ProgressViewWithPercentage: View {
    var progress: Double
    var label: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(label)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Text("\(Int(progress * 100))%")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
            }
            
            ProgressView(value: progress)
                .tint(.pink)
        }
    }
}

// MARK: - Loading Overlay Modifier
struct LoadingOverlay: ViewModifier {
    var isLoading: Bool
    var message: String
    
    func body(content: Content) -> some View {
        ZStack {
            content
                .disabled(isLoading)
            
            if isLoading {
                FullScreenLoadingView(message: message)
            }
        }
    }
}

extension View {
    func loadingOverlay(isLoading: Bool, message: String = "処理中...") -> some View {
        modifier(LoadingOverlay(isLoading: isLoading, message: message))
    }
}

// MARK: - Refresh Control
struct RefreshableScrollView<Content: View>: View {
    var onRefresh: () async -> Void
    @ViewBuilder var content: Content
    
    var body: some View {
        ScrollView {
            content
        }
        .refreshable {
            await onRefresh()
        }
    }
}

// MARK: - Preview
#Preview("Loading States") {
    VStack(spacing: 20) {
        LoadingView()
        
        InlineSpinner()
        
        LoadingButton(title: "送信", isLoading: true) {}
        
        CardSkeletonView()
        
        EmptyStateView(
            icon: "photo",
            title: "写真がありません",
            message: "まだ写真が投稿されていません。",
            actionTitle: "写真を追加",
            action: {}
        )
    }
}
