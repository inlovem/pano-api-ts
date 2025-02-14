// src/services/imageService.ts

import admin from '../config/firebase';
import { StoreImageDataInput } from '../schemas/imageProcessingSchema';

/**
 * Retrieves an image from Firebase Storage as a Buffer.
 *
 * @param imageId - The identifier (or file name) of the image in Firebase Storage.
 * @returns A promise that resolves with the image data as a Buffer.
 */
export async function getImageFromFirebase(imageId: string): Promise<Buffer> {
  const bucket = admin.storage().bucket();
  const file = bucket.file(imageId);

  const [exists] = await file.exists();
  if (!exists) {
    throw new Error(`Image with id "${imageId}" not found in Firebase Storage.`);
  }

  const [buffer] = await file.download();
  return buffer;
}

/**
 * Fetches a user's resources from the Firebase Realtime Database.
 *
 * @param userId - The Firebase Auth UID of the user.
 * @returns A promise that resolves with the user's data including indexed images and conversations.
 */
export async function fetchUserResources(userId: string) {
  const snapshot = await admin.database().ref(`/users/${userId}`).once('value');
  if (!snapshot.exists()) {
    throw new Error(`User ${userId} not found`);
  }
  return snapshot.val();
}

/* -------------------------------------------------------------------------- */
/*                        Data Indexing Interfaces                          */
/* -------------------------------------------------------------------------- */

/**
 * Defines the structure for an image entry in the RTDB index.
 */
export interface IndexedImage {
  resource_url: string;
  conversation_id?: number;
  audio_id?: number;
  message_reference?: number;
}

/**
 * Defines the structure for a conversation entry in the RTDB index.
 */
export interface IndexedConversation {
  reference: string;
  messages: string[];
}

/* -------------------------------------------------------------------------- */
/*                      Storage Functions for RTDB                          */
/* -------------------------------------------------------------------------- */

/**
 * Stores conversation information in the Firebase Realtime Database according to the defined schema.
 *
 * Indexed under:
 *   /users/{userId}/conversations/{conversationId}
 *
 * @param userId - The Firebase Auth UID of the user.
 * @param conversationId - The unique identifier for the conversation.
 * @param conversationData - The conversation data to store.
 */
export async function storeConversationData(
    userId: string,
    conversationId: string,
    conversationData: IndexedConversation
): Promise<void> {
  try {
    console.log('Storing conversation data:', conversationData);
    await admin.database().ref(`/users/${userId}/conversations/${conversationId}`).set(conversationData);
  } catch (error: any) {
    throw new Error(`Error storing conversation data: ${error.message || error}`);
  }
}



export async function storeImageData(
  userId: string,
  imageId: string,
  imageData: IndexedImage
): Promise<void> {
  try {
    console.log('Storing image data:', imageData);
    await admin
      .database()
      .ref(`/users/${userId}/images/${imageId}`)
      .set(imageData);
  } catch (error: any) {
    throw new Error(`Error storing image data: ${error.message || error}`);
  }
}

export async function getImageBuffer(storagePath: string): Promise<Buffer> {
  const bucket = admin.storage().bucket();
  const file = bucket.file(storagePath);
  const [buffer] = await file.download();
  return buffer;
}