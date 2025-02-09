// src/services/interaction.service.ts

import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { Interaction } from '../schemas/interaction';


// 2) We can now reference admin services safely
const interactions: Record<string, Interaction[]> = {};

export const InteractionService = {
    /**
     * Upload a file to Firebase Storage under:
     *   images/<USER_UID>/<INTERACTION_ID>/<RANDOM_ID>
     * Then set `interaction.fileUrl` to the resulting download URL,
     * and save the interaction in Realtime Database.
     */
    async uploadFileAndSaveInteraction(
        userUid: string,
        fileBuffer: Buffer,
        mimeType: string,
        interaction: Interaction
    ): Promise<Interaction> {
        try {
            // Bucket is now valid because admin has been initialized
            const bucket = admin.storage().bucket();
            // Nested folders: userUid -> interaction.id -> random file name
            const fileName = `images/${userUid}/${interaction.id}/${uuidv4()}`;

            // 1) Upload the file
            const fileRef = bucket.file(fileName);
            await fileRef.save(fileBuffer, {
                contentType: mimeType,
            });

            // 2) Generate a signed URL or make the file public
            const [signedUrl] = await fileRef.getSignedUrl({
                action: 'read',
                expires: '2099-12-31', // or a shorter date
            });

            // 3) Update interaction with the final URL
            interaction.fileUrl = signedUrl;

            // 4) Save the updated interaction
            if (!interactions[userUid]) {
                interactions[userUid] = [];
            }
            interactions[userUid].push(interaction);

            const db = admin.database();
            await db.ref(`interactions/${userUid}/${interaction.id}`).set(interaction);

            return interaction;
        } catch (error: any) {
            throw new Error(`Error uploading file and saving interaction: ${error.message || error}`);
        }
    },

    /**
     * Save an interaction directly (no file upload).
     */
    async saveInteraction(userUid: string, interaction: Interaction): Promise<Interaction> {
        if (!interactions[userUid]) {
            interactions[userUid] = [];
        }
        interactions[userUid].push(interaction);

        const db = admin.database();
        await db.ref(`interactions/${userUid}/${interaction.id}`).set(interaction);

        return interaction;
    },

    async getInteractionsByUserUid(userUid: string): Promise<Interaction[] | undefined> {
        const db = admin.database();
        const snapshot = await db.ref(`interactions/${userUid}`).once('value');
        return snapshot.val() ? Object.values(snapshot.val()) : [];
    },

    async getInteractionById(userUid: string, id: string): Promise<Interaction | undefined> {
        const db = admin.database();
        const snapshot = await db.ref(`interactions/${userUid}/${id}`).once('value');
        return snapshot.val() || undefined;
    },
};
