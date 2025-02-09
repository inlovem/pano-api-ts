// src/api/controllers/imageProcessingController.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import OpenAI from 'openai';
import { InteractionService } from '../services/interaction.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request body for generating an image description.
 */
interface ImageDescriptionRequestBody {
    // A base64-encoded image string (e.g., "data:image/png;base64,....")
    image_base64: string;
}

/**
 * Request body for the conversational route.
 */
interface ImageConversationRequestBody {
    // The full image description (generated earlier).
    imageDescription: string;
    // The user's follow-up question.
    question: string;
}

/**
 * Query parameters for the image description controller.
 */
interface ImageDescriptionQuery {
    uid: string; // The user's UID
}

/**
 * Controller for generating a high-detail image description.
 *
 * This controller accepts an uploaded image file, converts it into a data URL,
 * sends it to OpenAI with a multimodal prompt (text + image URL), and returns
 * the generated description.
 *
 * Note: Assumes that the Fastify multipart plugin is registered.
 */
export async function generateImageDescriptionController(
    request: FastifyRequest<{ Querystring: ImageDescriptionQuery }>,
    reply: FastifyReply
) {
    try {
        // 1) Retrieve userUid from the query string (?uid=...).
        const userUid = request.query.uid || 'unknown-uid';

        // 2) Access the uploaded file using fastify-multipart
        const data = await (request as any).file();
        if (!data) {
            return reply.status(400).send({ message: 'File is required.' });
        }

        /**
         * Helper function to convert a file stream to a Buffer.
         */
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

        // 3) Read the uploaded file stream into a Buffer.
        const fileBuffer = await streamToBuffer(data.file);

        // 4) Convert Buffer into a base64-encoded string for the OpenAI prompt
        //    (We do NOT store this base64 data in DB).
        const base64Image = fileBuffer.toString('base64');
        const dataUrl = `data:${data.mimetype};base64,${base64Image}`;

        // 5) Initialize OpenAI and call the Chat API
        const openai = new OpenAI();
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Provide a high context description of the image?' },
                        { type: 'image_url', image_url: { url: dataUrl } },
                    ],
                },
            ],
            store: true,
        });

        if (!response.choices || response.choices.length === 0) {
            return reply.status(500).send({ message: 'No description was generated.' });
        }

        // 6) Extract the generated image description
        const imageDescription = response.choices[0].message.content ?? 'No description available';
        const interactionId = uuidv4();

        // 7) Build an Interaction object for saving
        const interaction = {
            id: interactionId,
            fileUrl: '', // We'll set it after uploading to Firebase Storage
            uploadedBy: {
                uid: userUid,
                email: 'unknown@example.com',
            },
            timestamp: new Date().toISOString(),
            conversationData: {
                userMessage: 'Provide a high context description of the image?',
                responseMessage: imageDescription,
            },
            sharedWith: [],
            audioFiles: [],
        };

        // 8) Upload the file to Firebase Storage + save interaction to Realtime DB
        const savedInteraction = await InteractionService.uploadFileAndSaveInteraction(
            userUid,
            fileBuffer,
            data.mimetype,
            interaction
        );

        // 9) Return the final output
        return reply.status(200).send({
            imageDescription,
            storedFileUrl: savedInteraction.fileUrl,
        });
    } catch (error: any) {
        return reply.status(500).send({
            message: 'Error generating image description',
            error: error.message || error,
        });
    }
}

/**
 * Controller for having a conversation based on an image description.
 *
 * This controller accepts an image description and a user's follow-up question,
 * then uses the description as context to generate a conversational response.
 */
export async function imageConversationController(
    request: FastifyRequest<{ Body: ImageConversationRequestBody }>,
    reply: FastifyReply
) {
    let { imageDescription, question } = request.body;

    if (!imageDescription || !question) {
        return reply.status(400).send({
            message: 'Both "imageDescription" and "question" fields are required.',
        });
    }

    // Clean the input by removing extra line breaks and whitespace.
    imageDescription = imageDescription.replace(/[\r\n]+/g, ' ').trim();
    question = question.replace(/[\r\n]+/g, ' ').trim();

    try {
        // 1) Call OpenAI to generate a conversation answer
        const openai = new OpenAI();
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Image description: ${imageDescription}`,
                },
                {
                    role: 'user',
                    content: question,
                },
            ],
            store: true,
        });

        if (!response.choices || response.choices.length === 0) {
            return reply.status(500).send({
                message: 'No response was generated for the conversation.',
            });
        }

        // 2) Extract the assistant's reply
        const answer = response.choices[0].message.content ?? 'No description available';

        // 3) Retrieve the userUid from headers (or fallback)
        const userUid = (request.headers['x-user-uid'] as string) || 'unknown-uid';
        const interactionId = uuidv4();

        // 4) Save a new Interaction record (no file upload here)
        const interaction = {
            id: interactionId,
            fileUrl: '',
            uploadedBy: {
                uid: userUid,
                email: 'unknown@example.com',
            },
            timestamp: new Date().toISOString(),
            conversationData: {
                userMessage: question,
                responseMessage: answer,
            },
            sharedWith: [],
            audioFiles: [],
        };

        await InteractionService.saveInteraction(userUid, interaction);

        // 5) Return the conversation result
        return reply.status(200).send({ answer });
    } catch (error: any) {
        return reply.status(500).send({
            message: 'Error generating conversation response',
            error: error.message || error,
        });
    }
}
