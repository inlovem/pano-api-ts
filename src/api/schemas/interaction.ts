// src/api/schemas/interaction.ts
export interface Interaction {
    id: string; // Unique identifier
    fileUrl: string; // Link to stored file
    uploadedBy: {
        uid: string;
        email: string;
        phoneNumber?: string;
    };
    timestamp: string; // ISO format timestamp
    conversationData: {
        userMessage: string;
        responseMessage: string;
    };
    sharedWith: string[]; // List of emails this memory is shared with
    audioFiles: string[]; // List of URLs pointing to audio recordings
}
