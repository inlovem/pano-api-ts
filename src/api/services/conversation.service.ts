// src/services/conversation.service.ts
import admin from 'firebase-admin';

const firestore = admin.firestore();

/**
 * Basic shape of a Conversation document in Firestore.
 */
export interface Conversation {
    id: string;       // Same as memoryId for reference
    userUid: string;  // Owner's user UID
    // Additional fields as needed, e.g. an array of messages
    messages?: {
        role: string;    // "user" | "assistant" etc.
        content: string; // Message text
    }[];
}

export const ConversationService = {
    /**
     * Creates or overwrites a conversation document in Firestore.
     */
    async createConversation(convo: Conversation): Promise<Conversation> {
        const docRef = firestore.collection('conversations').doc(convo.id);

        // We do a "set" to ensure we overwrite or create new doc
        await docRef.set(convo, { merge: true });
        // Return the final object
        return convo;
    },

    /**
     * Retrieves a conversation by userUid + memoryId from Firestore.
     */
    async getConversation(userUid: string, memoryId: string): Promise<Conversation> {
        const docRef = firestore.collection('conversations').doc(memoryId);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            throw new Error(`Conversation with memoryId "${memoryId}" does not exist.`);
        }

        const conversation = snapshot.data() as Conversation;

        // Optional: confirm userUid matches
        if (conversation.userUid !== userUid) {
            throw new Error(`User UID mismatch; conversation belongs to ${conversation.userUid}`);
        }

        return conversation;
    },
};
