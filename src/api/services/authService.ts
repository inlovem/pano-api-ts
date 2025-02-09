import admin from '../config/firebase';  // or correct relative path
import { User } from '../schemas/user';

const db = admin.database();
const usersByUid: Record<string, User> = {};

/**
 * AuthService for managing user records in Realtime DB and in memory.
 */
export const AuthService = {
    async createUser(uid: string, user: User): Promise<User> {
        if (usersByUid[uid]) {
            return usersByUid[uid];
        }

        await db.ref(`users/${uid}`).set(user);
        usersByUid[uid] = user;
        return user;
    },

    async getUserByUid(uid: string): Promise<User | null> {
        if (usersByUid[uid]) {
            return usersByUid[uid];
        }

        const snapshot = await db.ref(`users/${uid}`).once('value');
        if (!snapshot.exists()) {
            return null;
        }

        const user = snapshot.val() as User;
        usersByUid[uid] = user;
        return user;
    },

    async authenticate(uid: string): Promise<boolean> {
        const user = await this.getUserByUid(uid);
        return user !== null;
    },
};
