//
//  PhotoGridView.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import SwiftUI

struct PhotoGridView: View {
    var eventId: String? = nil
    @StateObject private var viewModel = PhotoViewModel()
    @State private var showCamera = false
    @State private var selectedPhoto: Photo?
    
    let columns = [
        GridItem(.flexible(), spacing: 2),
        GridItem(.flexible(), spacing: 2),
        GridItem(.flexible(), spacing: 2)
    ]
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.photos.isEmpty {
                    emptyStateView
                } else {
                    photoGridView
                }
            }
            .navigationTitle("写真")
            .toolbar {
                if eventId != nil {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button(action: { showCamera = true }) {
                            Image(systemName: "camera.fill")
                        }
                    }
                }
            }
            .sheet(isPresented: $showCamera) {
                if let eventId = eventId {
                    CameraView(eventId: eventId, viewModel: viewModel)
                }
            }
            .sheet(item: $selectedPhoto) { photo in
                PhotoDetailView(photo: photo, viewModel: viewModel)
            }
            .task {
                if let eventId = eventId {
                    await viewModel.fetchPhotos(eventId: eventId, publishedOnly: false)
                }
            }
            .refreshable {
                if let eventId = eventId {
                    await viewModel.fetchPhotos(eventId: eventId, publishedOnly: false)
                }
            }
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "photo.on.rectangle.angled")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("写真がまだありません")
                .font(.headline)
            
            Text("写真を撮影してアップロードしましょう")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            if eventId != nil {
                Button(action: { showCamera = true }) {
                    Label("写真を撮る", systemImage: "camera.fill")
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
            }
        }
    }
    
    private var photoGridView: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 2) {
                ForEach(viewModel.photos) { photo in
                    Button(action: { selectedPhoto = photo }) {
                        AsyncImage(url: URL(string: photo.thumbnailUrl)) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Rectangle()
                                .fill(Color.gray.opacity(0.3))
                        }
                        .frame(height: 120)
                        .clipped()
                    }
                }
            }
        }
    }
}

#Preview {
    PhotoGridView()
}

#Preview("With Photos") {
    PhotoGridView(eventId: "event_preview")
}
