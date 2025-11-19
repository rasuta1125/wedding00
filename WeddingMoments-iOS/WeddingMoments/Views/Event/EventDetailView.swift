//
//  EventDetailView.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import SwiftUI

struct EventDetailView: View {
    let event: Event
    @StateObject private var viewModel = EventViewModel()
    @StateObject private var photoViewModel = PhotoViewModel()
    @State private var showQRCode = false
    @State private var showSettings = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Event Info Card
                eventInfoCard
                
                // QR Code Card
                qrCodeCard
                
                // Photos Section
                photosSection
                
                // Actions
                actionsSection
            }
            .padding()
        }
        .navigationTitle(event.eventName)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { showSettings = true }) {
                    Image(systemName: "gearshape")
                }
            }
        }
        .sheet(isPresented: $showQRCode) {
            QRCodeView(event: event)
        }
        .sheet(isPresented: $showSettings) {
            EventSettingsView(event: event, viewModel: viewModel)
        }
        .task {
            await photoViewModel.fetchPhotos(eventId: event.eventId, publishedOnly: false)
            viewModel.listenToEvent(eventId: event.eventId)
        }
        .onDisappear {
            viewModel.stopListening()
        }
    }
    
    private var eventInfoCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("イベント情報")
                    .font(.headline)
                
                Spacer()
                
                StatusBadge(status: event.status)
            }
            
            Divider()
            
            InfoRow(icon: "calendar", title: "日付", value: event.eventDate)
            
            if let location = event.eventLocation {
                InfoRow(icon: "mappin.circle", title: "場所", value: location)
            }
            
            InfoRow(icon: "person.2", title: "ゲスト", value: event.guestCountText)
            
            if event.isPublished {
                InfoRow(icon: "photo", title: "写真", value: "\(photoViewModel.photos.count)枚")
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
    
    private var qrCodeCard: some View {
        VStack(spacing: 12) {
            HStack {
                Text("ゲスト招待")
                    .font(.headline)
                
                Spacer()
            }
            
            Button(action: { showQRCode = true }) {
                HStack {
                    Image(systemName: "qrcode")
                        .font(.title2)
                    
                    VStack(alignment: .leading) {
                        Text("QRコードを表示")
                            .font(.headline)
                        Text("ゲストはQRコードをスキャンして参加できます")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                }
                .padding()
                .background(Color.blue.opacity(0.1))
                .cornerRadius(10)
            }
            .buttonStyle(.plain)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
    
    private var photosSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("写真")
                    .font(.headline)
                
                Spacer()
                
                if !event.isPublished {
                    Button(action: {
                        Task {
                            await viewModel.publishPhotos(for: event.eventId)
                        }
                    }) {
                        Label("公開", systemImage: "eye")
                            .font(.caption)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                    }
                }
            }
            
            if photoViewModel.photos.isEmpty {
                Text("まだ写真がアップロードされていません")
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding()
            } else {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 100))], spacing: 8) {
                    ForEach(photoViewModel.photos.prefix(6)) { photo in
                        AsyncImage(url: URL(string: photo.thumbnailUrl)) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Rectangle()
                                .fill(Color.gray.opacity(0.3))
                        }
                        .frame(width: 100, height: 100)
                        .clipped()
                        .cornerRadius(8)
                    }
                }
                
                if photoViewModel.photos.count > 6 {
                    Text("他 \(photoViewModel.photos.count - 6) 枚")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
    
    private var actionsSection: some View {
        VStack(spacing: 12) {
            NavigationLink(destination: PhotoGridView(eventId: event.eventId)) {
                ActionButton(icon: "photo.on.rectangle", title: "写真を見る", color: .blue)
            }
            
            Button(action: {
                // Download album
            }) {
                ActionButton(icon: "arrow.down.circle", title: "アルバムをダウンロード", color: .green)
            }
        }
    }
}

struct InfoRow: View {
    let icon: String
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Label(title, systemImage: icon)
                .foregroundColor(.secondary)
            
            Spacer()
            
            Text(value)
                .fontWeight(.medium)
        }
        .font(.subheadline)
    }
}

struct ActionButton: View {
    let icon: String
    let title: String
    let color: Color
    
    var body: some View {
        HStack {
            Image(systemName: icon)
            Text(title)
            Spacer()
            Image(systemName: "chevron.right")
        }
        .padding()
        .background(color.opacity(0.1))
        .foregroundColor(color)
        .cornerRadius(10)
    }
}

#Preview {
    NavigationStack {
        EventDetailView(event: .preview)
    }
}
