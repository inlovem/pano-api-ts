// src/services/recording.service.ts

import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { Interaction } from '../schemas/interaction';

export const RecordingService = {
    /**
     * Upload a recording (audio) to Firebase Storage under:
     *   recordings/<USER_UID>/<INTERACTION_ID>/<RANDOM_ID>
     * Then, append the resulting URL to the `audioFiles` field
     * in the specified Interaction (memory) in Realtime Database.
     */
    async uploadRecording(
        userUid: string,
        interactionId: string,
        fileBuffer: Buffer,
        mimeType: string
    ): Promise<Interaction> {

        // 1) Retrieve the existing Interaction (memory)
        const db = admin.database();
        const interactionRef = db.ref(`interactions/${userUid}/${interactionId}`);
        const snapshot = await interactionRef.once('value');

        if (!snapshot.exists()) {
            throw new Error(`Interaction (memory) with ID "${interactionId}" does not exist.`);
        }

        const interaction = snapshot.val() as Interaction;

        // 2) Upload file to Storage
        const bucket = admin.storage().bucket();
        const fileName = `recordings/${userUid}/${interactionId}/${uuidv4()}`;

        const fileRef = bucket.file(fileName);
        await fileRef.save(fileBuffer, { contentType: mimeType });

        // 3) Generate a signed URL (or make it public)
        const [signedUrl] = await fileRef.getSignedUrl({
            action: 'read',
            expires: '2099-12-31',
        });

        // 4) Ensure audioFiles is an array before pushing
        if (!Array.isArray(interaction.audioFiles)) {
            interaction.audioFiles = [];
        }

        interaction.audioFiles.push(signedUrl);

        // 5) Persist the updated interaction in Realtime Database
        await interactionRef.set(interaction);

        return interaction;
    }
};
