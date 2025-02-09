import { FastifyRequest, FastifyReply } from 'fastify';
import { RecordingService } from '../services/recording.service';

interface RecordingQuery {
    uid: string;
    memoryId: string;
}

export async function uploadRecordingController(
    request: FastifyRequest<{ Querystring: RecordingQuery }>,
    reply: FastifyReply
) {
    try {
        // Retrieve typed query parameters
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

        // Respond with updated interaction (including new audio file link)
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
