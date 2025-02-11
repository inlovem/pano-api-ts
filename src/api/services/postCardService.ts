// src/services/postcardService.ts
import admin from '../config/firebase';
import { IPostcard } from '../types/interfaces';

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
export async function createPostCard(
    userId: string,
    attributes: { s3Key?: string; transcript?: string }
): Promise<any> {
  // Generate a new ID (in a real application, your database might generate this)
  const generatedId = Math.random().toString(36).substring(2, 10);

  // Construct the postcard object
  const newPostCard = {
    id: generatedId,
    type: 'postCard',
    attributes,
    userId, // Associate the postcard with the user.
  };

  // Persist the new postcard in Firebase
  await db.ref(`postcards/${generatedId}`).set(newPostCard);

  return newPostCard;
}
