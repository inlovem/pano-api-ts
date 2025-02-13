import admin from "firebase-admin";
import {IUserData} from "src/api/types/interfaces";

export async function registerUserService(userData: IUserData): Promise<void> {

  const { uid } = userData;
  
  if (!uid) {
    throw new Error("User data must include a valid uid. ");
  }

  try {
    const userRef = admin.database().ref(`users/${uid}`);
    await userRef.set(userData);
  } catch (error) {
    throw new Error("Failed to register user: " + error);
  }
}
