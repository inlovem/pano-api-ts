// src/services/postcardService.ts

import admin from '../config/firebase';
import { IPostcard } from '../types/interfaces';

const db = admin.database();

/**
 * Retrieves a single postcard by its ID for a given user.
 * @param userId - The ID of the user who owns the postcard.
 * @param postcardId - The unique key (ID) of the postcard.
 * @returns The postcard data or null if not found.
 */
export async function fetchUserPostCard(
  userId: string,
  postcardId: string
): Promise<IPostcard | null> {
  const snapshot = await db.ref(`postcards/${userId}/${postcardId}`).once('value');
  if (!snapshot.exists()) {
    return null;
  }
  const data = snapshot.val() as IPostcard;
  return { id: postcardId, ...data };
}

/**
 * Fetches all postcards for a specific user.
 * @param userId - The ID of the user whose postcards to retrieve.
 * @returns An array of matching postcards. Returns an empty array if none found.
 */
export async function fetchUserPostCards(userId: string): Promise<IPostcard[]> {
  const snapshot = await db.ref(`postcards/${userId}`).once('value');
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
 * Updates the specified postcard with new attributes for a given user.
 * @param userId - The ID of the user who owns the postcard.
 * @param postcardId - The unique key (ID) of the postcard to update.
 * @param newAttributes - Key-value pairs to update on the postcard.
 * @returns A promise that resolves when the update is complete.
 */
export async function updateUserPostCard(
  userId: string,
  postcardId: string,
  newAttributes: Partial<IPostcard>
): Promise<void> {

  const existing = await fetchUserPostCard(userId, postcardId);
  if (!existing) throw new Error('Postcard not found or unauthorized.');

  await db.ref(`postcards/${userId}/${postcardId}`).update(newAttributes);
}

/**
 * Fetches all postcards received by a user.
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

  const rawData = snapshot.val() as Record<string, IPostcard>;
  return Object.entries(rawData).map(([key, val]) => ({
    id: key,
    ...val,
  }));
}
