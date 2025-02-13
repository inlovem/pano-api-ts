/// <reference path="../types/fastify/index.d.ts" />

import { FastifyRequest, FastifyReply } from 'fastify';
import OpenAI from 'openai';
import { streamToBuffer } from '../utils/streamToBuffer';
import fs from 'fs';
import { waitOnRunCompletion } from '../utils/waitOnRunComplete';
import { storeImageData, storeConversationData } from '../services/imageService';
import { decodeJWT } from '../utils/authUser';

/**
 * Controller for generating a high-detail image description.
 *
 * Supports file data from either in-memory (via fastify-multipart) or disk (via multer).
 * After generating the image description, it stores the image metadata in the Firebase Realtime Database.
 */
export async function generateImageDescriptionController(
    request: FastifyRequest,
    reply: FastifyReply
) {
  try {
    let data: any;
    let fileBuffer: Buffer;
    let mimetype: string;

    // Use the augmented property "fileData" (or fallback to "file")
    if (request.fileData) {
      data = request.fileData;
      fileBuffer = await streamToBuffer(data.file);
      mimetype = data.mimetype;
    } else if (request.file) {
      data = request.file;
      fileBuffer = fs.readFileSync(data.path);
      mimetype = data.mimetype;
    } else {
        return reply.status(400).send({ message: 'File is required.' });
    }

    // Convert file to a base64-encoded Data URL.
    const base64Image = fileBuffer.toString('base64');
    const dataUrl = `data:${mimetype};base64,${base64Image}`;

    // Generate image description using OpenAI.
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: "Provide a high context description of the image?" },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      store: true,
    });

    if (!response.choices || response.choices.length === 0) {
      return reply.status(500).send({ message: 'No description was generated.' });
    }
    const imageDescription = response.choices[0].message.content;

    // Decode JWT so that request.user is populated.
    await decodeJWT(request, reply);
    if (!request.user || !request.user.uid) {
      return reply.status(401).send({ message: 'User not authenticated' });
    }
    const userId: string = request.user.uid;

    // Generate a unique image ID (using the current timestamp).
    const imageId = Date.now().toString();

    // Store image metadata (resource_url is the base64 image data URL).
    await storeImageData(userId, imageId, { resource_url: dataUrl });

    return reply.status(200).send({ imageDescription });
  } catch (error: any) {
    console.error('Error in generateImageDescriptionController:', error);
    return reply.status(500).send({
      message: 'Error generating image description',
      error: error.message || error,
    });
  }
}

/**
 * Controller for having a conversation based on an image description.
 *
 * Supports:
 * - Thread-based conversation if a `threadId` is provided,
 * - Simple chat completion otherwise.
 *
 * After generating a response, it stores the conversation metadata in Firebase Realtime Database.
 *
 * Expected request body:
 * {
 *   imageDescription: string,
 *   question: string,
 *   threadId?: string
 * }
 */
export async function imageConversationController(
    request: FastifyRequest<{
      Body: {
        imageDescription: string;
        question: string;
        threadId?: string;
      };
    }>,
    reply: FastifyReply
) {
  const { imageDescription, question, threadId } = request.body;
  // Clean inputs by removing extra line breaks and whitespace.
  const cleanedImageDescription = imageDescription.replace(/[\r\n]+/g, ' ').trim();
  const cleanedQuestion = question.replace(/[\r\n]+/g, ' ').trim();

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const assistantId = process.env.OPENAI_ASSISTANT_ID as string;

    // Decode JWT so that request.user is populated.
    await decodeJWT(request, reply);
    if (!request.user || !request.user.uid) {
      return reply.status(401).send({ message: 'User not authenticated' });
    }
    const userId: string = request.user.uid;

    // --- Thread-Based Conversation Mode ---
    if (threadId) {
      const userMessage = {
        role: "user" as const,
        content: cleanedQuestion,
      };
      await openai.beta.threads.messages.create(threadId, userMessage);

      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      });

      // Wait until the run is complete.
      await waitOnRunCompletion(openai, run.id, threadId);

      // Retrieve messages from the thread; assume the latest is the assistant’s reply.
      const responseMessages = await openai.beta.threads.messages.list(threadId, { order: 'desc' });
      if (!responseMessages.data || responseMessages.data.length === 0) {
        return reply.status(500).send({
          message: 'No response was generated in the conversation thread.',
        });
      }
      const rawAnswer = responseMessages.data[0].content;
      const answerStr = Array.isArray(rawAnswer) ? rawAnswer.join(" ") : (rawAnswer ?? "");

      // Use non-null assertion for threadId (it's defined in this branch).
      await storeConversationData(userId, threadId!, {
        reference: `conversations/${threadId!}`,
        messages: [cleanedQuestion, answerStr],
      });

      return reply.status(200).send({ answer: answerStr, threadId });
    }
    // --- Simple Chat Completion Mode ---
    else {
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
      const rawAnswerSimple = response.choices[0].message.content;
      const answerStrSimple = Array.isArray(rawAnswerSimple)
          ? rawAnswerSimple.join(" ")
          : (rawAnswerSimple ?? "");

      // Generate a new conversation ID (using the current timestamp).
      const conversationId = Date.now().toString();
      await storeConversationData(userId, conversationId, {
        reference: `conversations/${conversationId}`,
        messages: [cleanedQuestion, answerStrSimple],
      });

      return reply.status(200).send({ answer: answerStrSimple });
    }
  } catch (error: any) {
    console.error('Error in imageConversationController:', error);
    return reply.status(500).send({
      message: 'Error generating conversation response',
      error: error.message || error,
    });
  }
}
