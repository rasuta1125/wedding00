//
//  EventSettingsView.swift
//  WeddingMoments
//
//  Created by AI Developer on 2024-11-19.
//

import SwiftUI

struct EventSettingsView: View {
    let event: Event
    @ObservedObject var viewModel: EventViewModel
    @Environment(\.dismiss) var dismiss
    
    @State private var allowGuestDownload: Bool
    @State private var watermark: Bool
    @State private var compressionQuality: Double
    
    init(event: Event, viewModel: EventViewModel) {
        self.event = event
        self.viewModel = viewModel
        _allowGuestDownload = State(initialValue: event.settings.allowGuestDownload)
        _watermark = State(initialValue: event.settings.watermark)
        _compressionQuality = State(initialValue: event.settings.compressionQuality)
    }
    
    var body: some View {
        NavigationStack {
            Form {
                Section("写真設定") {
                    Toggle("ゲストのダウンロードを許可", isOn: $allowGuestDownload)
                    
                    Toggle("透かしを追加", isOn: $watermark)
                    
                    VStack(alignment: .leading) {
                        Text("画質: \(Int(compressionQuality * 100))%")
                            .font(.subheadline)
                        
                        Slider(value: $compressionQuality, in: 0.5...1.0, step: 0.1)
                    }
                }
                
                Section("イベント管理") {
                    Button(role: .destructive, action: {
                        Task {
                            let success = await viewModel.deleteEvent(event)
                            if success {
                                dismiss()
                            }
                        }
                    }) {
                        Label("イベントをアーカイブ", systemImage: "archivebox")
                    }
                }
            }
            .navigationTitle("設定")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("キャンセル") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") {
                        Task {
                            var updatedEvent = event
                            updatedEvent.settings.allowGuestDownload = allowGuestDownload
                            updatedEvent.settings.watermark = watermark
                            updatedEvent.settings.compressionQuality = compressionQuality
                            
                            let success = await viewModel.updateEvent(updatedEvent)
                            if success {
                                dismiss()
                            }
                        }
                    }
                }
            }
        }
    }
}

#Preview {
    EventSettingsView(event: .preview, viewModel: EventViewModel())
}
