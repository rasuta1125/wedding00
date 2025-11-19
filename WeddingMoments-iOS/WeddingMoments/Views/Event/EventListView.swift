//
//  EventListView.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import SwiftUI

struct EventListView: View {
    @StateObject private var viewModel = EventViewModel()
    @State private var showCreateEvent = false
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.events.isEmpty {
                    emptyStateView
                } else {
                    eventListView
                }
            }
            .navigationTitle("イベント")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showCreateEvent = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showCreateEvent) {
                CreateEventView(viewModel: viewModel)
            }
            .task {
                await viewModel.fetchEvents()
            }
            .refreshable {
                await viewModel.fetchEvents()
            }
            .overlay {
                if viewModel.isLoading {
                    ProgressView()
                }
            }
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "calendar.badge.plus")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("イベントがまだありません")
                .font(.headline)
            
            Text("最初のイベントを作成しましょう")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            Button(action: { showCreateEvent = true }) {
                Label("イベントを作成", systemImage: "plus.circle.fill")
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
        }
    }
    
    private var eventListView: some View {
        List(viewModel.events) { event in
            NavigationLink(destination: EventDetailView(event: event)) {
                EventRowView(event: event)
            }
        }
        .listStyle(.plain)
    }
}

struct EventRowView: View {
    let event: Event
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(event.eventName)
                    .font(.headline)
                
                Spacer()
                
                StatusBadge(status: event.status)
            }
            
            HStack(spacing: 16) {
                Label(event.eventDate, systemImage: "calendar")
                
                if let location = event.eventLocation {
                    Label(location, systemImage: "mappin.circle")
                }
            }
            .font(.caption)
            .foregroundColor(.secondary)
            
            HStack {
                Label(event.guestCountText, systemImage: "person.2")
                    .font(.caption)
                
                Spacer()
                
                if event.isPublished {
                    Label("公開済み", systemImage: "checkmark.circle.fill")
                        .font(.caption)
                        .foregroundColor(.green)
                }
            }
        }
        .padding(.vertical, 8)
    }
}

struct StatusBadge: View {
    let status: Event.EventStatus
    
    var body: some View {
        Text(statusText)
            .font(.caption2)
            .fontWeight(.semibold)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(statusColor)
            .foregroundColor(.white)
            .cornerRadius(4)
    }
    
    private var statusText: String {
        switch status {
        case .draft: return "下書き"
        case .active: return "開催中"
        case .ended: return "終了"
        case .archived: return "アーカイブ"
        }
    }
    
    private var statusColor: Color {
        switch status {
        case .draft: return .gray
        case .active: return .green
        case .ended: return .orange
        case .archived: return .red
        }
    }
}

#Preview {
    EventListView()
}

#Preview("Event Row") {
    List {
        EventRowView(event: .preview)
    }
}
