// src/services/postcardService.ts

import admin from '../config/firebase';
import { IPostcard } from '../types/interfaces';

const db = admin.database();

/**
 * Retrieves a single postcard by its ID.
 * @param postcardId - The unique key (ID) of the postcard in the `postcards/` node.
 * @returns The postcard data or null if not found.
 */
export async function fetchUserPostCard(postcardId: string): Promise<IPostcard | null> {
  const snapshot = await db.ref(`postcards/${postcardId}`).once('value');
  if (!snapshot.exists()) {
    return null;
  }
  const data = snapshot.val() as IPostcard;
  return { id: postcardId, ...data };
}

/**
 * Fetches all postcards for a specific user based on `userId`.
 * @param userId - The ID of the user whose postcards to retrieve.
 * @returns An array of matching postcards. Returns an empty array if none found.
 */

export async function fetchUserPostCards(userId: string): Promise<IPostcard[]> {
  const snapshot = await db
    .ref('postcards')
    .orderByChild('userId')
    .equalTo(userId)
    .once('value');

  if (!snapshot.exists()) {
    return [];
  }

  // snapshot.val() is an object keyed by postcardId => postcardData
  const rawData = snapshot.val() as Record<string, IPostcard>;
  return Object.entries(rawData).map(([key, val]) => ({
    id: key,
    ...val,
  }));
}

/**
 * Updates the specified postcard with new attributes.
 * @param userId - The ID of the user who owns the postcard (not strictly used here unless you want additional checks).
 * @param postcardId - The unique key (ID) of the postcard to update.
 * @param newAttributes - Key-value pairs to update on the postcard.
 * @returns A promise that resolves when the update is complete (or rejects on error).
 */
export async function updateUserPostCard(
  userId: string,
  postcardId: string,
  newAttributes: Partial<IPostcard>
): Promise<void> {

    const newAttributesWithUserId = { ...newAttributes, userId };
    await db.ref(`postcards/${postcardId}`).update(newAttributesWithUserId);
}

/**
 * Fetches all postcards where the `recipientId` matches the given user.
 * @param userId - The ID of the user who received these postcards.
 * @returns An array of matching postcards. Returns an empty array if none found.
 */
export async function fetchReceivedPostCards(userId: string): Promise<IPostcard[]> {
  const snapshot = await db
    .ref('postcards')
    .orderByChild('recipientId')
    .equalTo(userId)
    .once('value');

  if (!snapshot.exists()) {
    return [];
  }

  // snapshot.val() is an object keyed by postcardId => postcardData
  const rawData = snapshot.val() as Record<string, IPostcard>;
  return Object.entries(rawData).map(([key, val]) => ({
    id: key,
    ...val,
  }));
}
