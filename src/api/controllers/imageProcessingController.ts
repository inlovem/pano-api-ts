// src/api/controllers/imageProcessingController.ts
import {FastifyRequest, FastifyReply} from 'fastify';
import OpenAI from 'openai';
import {lookup} from 'mime-types';

/**
 * Interface for the image conversation request using JSON:API structure.
 */
// src/api/controllers/imageProcessingController.ts
export interface ImageConversationRequest {
    data: {
        type: "imageConversation";
        attributes: {
            imageDescription: string;
            question: string;
        };
    };
}

/**
 * Controller for generating a high-detail image description.
 *
 * This controller accepts an uploaded image file, converts it into a data URL,
 * sends it to OpenAI with a multimodal prompt (text + image URL), and returns the
 * generated description in a JSON:API compliant format.
 *
 * Note: This function assumes that the Fastify multipart plugin is registered.
 */
export async function generateImageDescriptionController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        // Retrieve the file using Fastify multipart.
        const data = await (request as any).file();
        if (!data) {
            return reply.status(400).send({message: 'File is required.'});
        }

        /**
         * Helper function to convert a stream to a Buffer.
         * @param stream - The file stream from the upload.
         * @returns A Promise that resolves to a Buffer containing the file data.
         */
        async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
            const chunks: Buffer[] = [];
            return new Promise((resolve, reject) => {
                stream.on('data', (chunk) => {
                    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
                });
                stream.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    resolve(buffer);
                });
                stream.on('error', (err) => {
                    reject(err);
                });
            });
        }

        // Convert the uploaded file stream into a Buffer.
        const fileBuffer = await streamToBuffer(data.file);

        // Convert the Buffer into a base64-encoded string.
        const base64Image = fileBuffer.toString('base64');
        // Determine the MIME type:
        // If data.mimetype is missing or not valid, try to derive it from the filename using mime-types.
        let fileMime = data.mimetype;
        if (!fileMime || !fileMime.startsWith("image/")) {
            if (data.filename) {
                fileMime = lookup(data.filename) || '';
            }
        }
        if (!fileMime || !fileMime.startsWith("image/")) {
            return reply.status(400).send({message: 'Invalid MIME type. Only image types are supported.'});
        }
        // Construct a data URL using the determined MIME type.
        const dataUrl = `data:${fileMime};base64,${base64Image}`;
        // Initialize the OpenAI client.
        const openai = new OpenAI();
        // Call the OpenAI Chat API with a multimodal prompt that includes the data URL.
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: [
                        {type: 'text', text: "Provide a high context description of the image?"},
                        {type: 'image_url', image_url: {url: dataUrl}},
                    ],
                },
            ],
            store: true,
        });

        // Ensure that the API returned a valid response.
        if (!response.choices || response.choices.length === 0) {
            return reply.status(500).send({message: 'No description was generated.'});
        }

        // Extract the generated image description from the response.
        const imageDescription = response.choices[0].message.content;
        // Return the description in JSON:API format.
        return reply.status(200).send({
            data: {
                type: "imageDescription",
                attributes: {
                    imageDescription: imageDescription,
                },
            },
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
 * This controller accepts an image description and a user's follow-up question
 * in JSON:API format, then uses the description as context to generate a conversational response.
 */
export async function imageConversationController(
    request: FastifyRequest<{ Body: ImageConversationRequest }>,
    reply: FastifyReply
) {
    // Extract the JSON:API–formatted request.
    const {data} = request.body;
    if (!data || data.type !== "imageConversation" || !data.attributes) {
        return reply.status(400).send({
            message:
                'Invalid request format. Expected JSON:API format with data.type "imageConversation".',
        });
    }

    const {imageDescription, question} = data.attributes;

    if (!imageDescription || !question) {
        return reply.status(400).send({
            message: 'Both "imageDescription" and "question" fields are required.',
        });
    }

    // Clean the input by removing extra line breaks and whitespace.
    const cleanedImageDescription = imageDescription.replace(/[\r\n]+/g, ' ').trim();
    const cleanedQuestion = question.replace(/[\r\n]+/g, ' ').trim();

    try {
        // Initialize the OpenAI client.
        const openai = new OpenAI();

        // Build the conversation context.
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Image description: ${cleanedImageDescription}`,
                },
                {
                    role: 'user',
                    content: cleanedQuestion,
                },
            ],
            store: true,
        });

        if (!response.choices || response.choices.length === 0) {
            return reply.status(500).send({
                message: 'No response was generated for the conversation.',
            });
        }

        // Extract the assistant's reply.
        const answer = response.choices[0].message.content;

        // Return the answer in JSON:API format.
        return reply.status(200).send({
            data: {
                type: "imageConversation",
                attributes: {
                    answer: answer,
                },
            },
        });
    } catch (error: any) {
        return reply.status(500).send({
            message: 'Error generating conversation response',
            error: error.message || error,
        });
    }
}
