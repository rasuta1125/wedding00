//
//  PhotoDetailView.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import SwiftUI

struct PhotoDetailView: View {
    let photo: Photo
    @ObservedObject var viewModel: PhotoViewModel
    @Environment(\.dismiss) var dismiss
    @State private var showDeleteConfirmation = false
    @State private var scale: CGFloat = 1.0
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                ScrollView([.horizontal, .vertical]) {
                    AsyncImage(url: URL(string: photo.mediumUrl)) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .scaleEffect(scale)
                            .gesture(
                                MagnificationGesture()
                                    .onChanged { value in
                                        scale = value
                                    }
                                    .onEnded { _ in
                                        withAnimation {
                                            if scale < 1.0 {
                                                scale = 1.0
                                            } else if scale > 3.0 {
                                                scale = 3.0
                                            }
                                        }
                                    }
                            )
                    } placeholder: {
                        ProgressView()
                    }
                    .frame(width: geometry.size.width, height: geometry.size.height)
                }
            }
            .navigationTitle("写真詳細")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("閉じる") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button(action: {
                            // Share photo
                            sharePhoto()
                        }) {
                            Label("共有", systemImage: "square.and.arrow.up")
                        }
                        
                        Button(role: .destructive, action: {
                            showDeleteConfirmation = true
                        }) {
                            Label("削除", systemImage: "trash")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
            .alert("写真を削除", isPresented: $showDeleteConfirmation) {
                Button("キャンセル", role: .cancel) { }
                Button("削除", role: .destructive) {
                    Task {
                        let success = await viewModel.deletePhoto(photo)
                        if success {
                            dismiss()
                        }
                    }
                }
            } message: {
                Text("この写真を削除しますか？この操作は取り消せません。")
            }
        }
    }
    
    private func sharePhoto() {
        guard let url = URL(string: photo.originalUrl) else { return }
        
        // Download and share
        Task {
            do {
                let (data, _) = try await URLSession.shared.data(from: url)
                if let image = UIImage(data: data) {
                    await MainActor.run {
                        let activityVC = UIActivityViewController(
                            activityItems: [image],
                            applicationActivities: nil
                        )
                        
                        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                           let window = windowScene.windows.first,
                           let rootVC = window.rootViewController {
                            rootVC.present(activityVC, animated: true)
                        }
                    }
                }
            } catch {
                print("Failed to share photo: \(error)")
            }
        }
    }
}

#Preview {
    PhotoDetailView(photo: .preview, viewModel: PhotoViewModel())
}
