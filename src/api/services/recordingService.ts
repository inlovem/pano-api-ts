// src/services/recordingService.ts

import admin from '../config/firebase';
import { IUser, IRecording } from '../types/interfaces';
const db = admin.database();

/**
 * Fetches a user recording from Firebase Realtime Database.
 *
 * @param user - The current user (for potential authorization checks in the future)
 * @param recording - The recording object or { id: string } used to derive the recording id
 * @returns A promise resolving to the recording object or null if not found
 */
export async function fetchUserRecording(
  user: IUser,
  recording: { id: string }
): Promise<IRecording | null> {

  const snapshot = await db.ref(`recordings/${recording.id}`).once('value');
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
 * @param user - The current user (for potential authorization checks)
 * @param recording - The recording object or { id: string }
 * @param newAttributes - The attributes to update on the recording
 * @returns A promise resolving to the updated recording object or null if not found
 */
export async function updateUserRecording(
  user: IUser,
  recording: { id: string },
  newAttributes: any
): Promise<IRecording | null> {
 
  const filteredAttributes = pick(newAttributes, ['s3Key', 'transcript']);
  const existingRecording = await fetchUserRecording(user, recording);

  if (!existingRecording) {
    return null;
  }

  await db.ref(`recordings/${recording.id}`).update(filteredAttributes);

  const updatedSnapshot = await db.ref(`recordings/${recording.id}`).once('value');
  return updatedSnapshot.val();
}
