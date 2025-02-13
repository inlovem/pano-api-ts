import admin from "firebase-admin";
import {IUserData} from "src/api/types/interfaces";

export async function registerUserService(userData: IUserData): Promise<void> {
  const { uid } = userData;

  if (!uid) {
    throw new Error("User data must include a valid uid. ");
  }

  // Store all user data directly under the user's UID
  const userRef = admin.database().ref(`users/${uid}`);
  await userRef.set(userData);
}
