// src/services/recordingService.ts

<<<<<<< HEAD
import admin from '../config/firebase';
import { IUser, IRecording } from '../types/interfaces';
=======
import admin from 'firebase-admin';
import { IRecording } from '../types/interfaces';
>>>>>>> fastify-image-changes
const db = admin.database();

/**
 * Fetches a user recording from Firebase Realtime Database.
 *
 * @param userId - The current user's ID.
 * @param recording - An object containing the recording id.
 * @returns A promise resolving to the recording object or null if not found.
 */
export async function fetchUserRecording(
  userId: string,
  recording: { id: string }
): Promise<IRecording | null> {
  const snapshot = await db.ref(`recordings/${userId}/${recording.id}`).once('value');
  return snapshot.val();
}

/**
 * Picks only allowed attributes from the given object.
 */
function pick(obj: Record<string, any>, keys: string[]): Record<string, any> {
  return keys.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Updates a user recording in Firebase Realtime Database.
 * Only allowed attributes (s3Key, transcript) are updated.
 *
 * @param userId - The current user's ID.
 * @param recording - An object containing the recording id.
 * @param newAttributes - The attributes to update on the recording.
 * @returns A promise resolving to the updated recording object or null if not found.
 */
export async function updateUserRecording(
  userId: string,
  recording: { id: string },
  newAttributes: any
): Promise<IRecording | null> {
  const filteredAttributes = pick(newAttributes, ['s3Key', 'transcript']);
  const existingRecording = await fetchUserRecording(userId, recording);

  if (!existingRecording) {
    return null;
  }

  await db.ref(`recordings/${userId}/${recording.id}`).update(filteredAttributes);

  const updatedSnapshot = await db.ref(`recordings/${userId}/${recording.id}`).once('value');
  return updatedSnapshot.val();
}
