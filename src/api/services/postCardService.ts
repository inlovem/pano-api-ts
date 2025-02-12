// src/services/postcardService.ts
import admin from '../config/firebase';
import { IPostcard } from '../types/interfaces';
import {v4 as uuidv4} from 'uuid';

const db = admin.database();

/**
 * Retrieves a single postcard by its ID.
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

  const rawData = snapshot.val() as Record<string, IPostcard>;
  return Object.entries(rawData).map(([key, val]) => ({
    id: key,
    ...val,
  }));
}

/**
 * Updates the specified postcard with new attributes.
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

/**
 * Creates a new postcard record for the given user.
 */
/**
 * Creates a new postcard record for the given user.
 * Stores full postcard data under `/postcards/{postcardId}`
 * and adds a reference to the user’s info at `/users/{userId}/userinfo/postcards/{postcardId}`.
 */

export async function createPostCard(
    userId: string,
    attributes: { s3Key?: string; transcript?: string }
): Promise<IPostcard> {
  // Generate a new unique postcard ID
  const generatedId = uuidv4();

  // Construct the full postcard object matching the IPostcard interface
  const newPostCard: IPostcard = {
    id: generatedId,
    userId,
    s3Key: attributes.s3Key,
    transcript: attributes.transcript,
  };

  // Save the full postcard data in the central collection
  await db.ref(`postcards/${generatedId}`).set(newPostCard);

  // Instead of storing the whole postcard object in the user's info,
  // we store just the reference (the postcard id).
  await db.ref(`users/${userId}/postcards/${generatedId}`).set(generatedId);

  return newPostCard;
}
