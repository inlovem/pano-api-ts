// src/api/controllers/recordingController.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import { RecordingService } from '../services/recording.service';

interface RecordingQuery {
    uid: string;
    memoryId: string;
}

/**
 * Upload an audio recording to an existing interaction (memory).
 */
export async function uploadRecordingController(
    request: FastifyRequest<{ Querystring: RecordingQuery }>,
    reply: FastifyReply
) {
    try {
        const { uid: userUid, memoryId: interactionId } = request.query;

        if (!userUid || !interactionId) {
            return reply.status(400).send({
                message: 'Missing user UID or memory (interaction) ID in query parameters.'
            });
        }

        // Use fastify-multipart to get the file
        const data = await (request as any).file();
        if (!data) {
            return reply.status(400).send({ message: 'Audio file is required.' });
        }

        // Convert the file stream to a Buffer
        async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
            const chunks: Buffer[] = [];
            return new Promise((resolve, reject) => {
                stream.on('data', (chunk) => {
                    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
                });
                stream.on('end', () => resolve(Buffer.concat(chunks)));
                stream.on('error', reject);
            });
        }

        const fileBuffer = await streamToBuffer(data.file);

        // Now call our RecordingService
        const updatedInteraction = await RecordingService.uploadRecording(
            userUid,
            interactionId,
            fileBuffer,
            data.mimetype
        );

        return reply.status(200).send({
            message: 'Audio recording uploaded successfully',
            updatedInteraction
        });
    } catch (error: any) {
        return reply.status(500).send({
            message: 'Error uploading audio recording',
            error: error.message || error
        });
    }
}

/**
 * Fetch an interaction by user UID + memory ID (including its audio files).
 */
export async function getRecordingController(
    request: FastifyRequest<{ Querystring: RecordingQuery }>,
    reply: FastifyReply
) {
    try {
        const { uid: userUid, memoryId: interactionId } = request.query;

        if (!userUid || !interactionId) {
            return reply.status(400).send({
                message: 'Missing user UID or memory (interaction) ID in query parameters.'
            });
        }

        // Retrieve the entire interaction
        const interaction = await RecordingService.fetchInteraction(userUid, interactionId);

        // Return it (including audioFiles, conversationData, etc.)
        return reply.status(200).send({
            message: 'Fetched interaction successfully',
            interaction
        });
    } catch (error: any) {
        return reply.status(500).send({
            message: 'Error fetching interaction',
            error: error.message || error
        });
    }
}
