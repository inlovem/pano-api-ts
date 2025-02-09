// src/api/controllers/imageProcessingController.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import OpenAI from 'openai';
import { streamToBuffer } from '../utils/streamToBuffer';
import fs from 'fs';
import { waitOnRunCompletion } from '../utils/waitOnRunComplete';

/**
 * Controller for generating a high-detail image description.
 *
 * Supports file data from either in-memory (e.g. via fastify-multipart) or disk (e.g. via multer).
 */
export async function generateImageDescriptionController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    let data: any;
    let fileBuffer: Buffer;
    let mimetype: string;

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
    
    const base64Image = fileBuffer.toString('base64');
    const dataUrl = `data:${mimetype};base64,${base64Image}`;


    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Send a multimodal prompt including a text prompt and the image URL.
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
 * This controller supports two modes:
 * - If a `threadId` is provided in the request body, it uses OpenAI's beta threads API
 *   to maintain persistent conversation context.
 * - Otherwise, it falls back to a simple chat completion.
 *
 * Expected request body:
 * {
 *   imageDescription: string,
 *   question: string,
 *   threadId?: string  // optional, for persistent conversation threads
 * }
 */
export async function imageConversationController(
  request: FastifyRequest<{ 
    Body: { 
      imageDescription: string; 
      question: string; 
      threadId?: string;
    } 
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

    // --- Thread-Based Conversation Mode ---
    if (threadId) {

      const userMessage: { role: "user"; content: string } = {
        role: "user",
        content: cleanedQuestion,
      };
      await openai.beta.threads.messages.create(threadId, userMessage);
      
   
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
        // If you need streaming, include stream: true along with other parameters.
        // stream: true,
      });
      
      // Wait until the run is complete.
      await waitOnRunCompletion(openai, run.id, threadId);
      
      // Retrieve messages from the thread; assume the latest message is the assistant's reply.
      const responseMessages = await openai.beta.threads.messages.list(threadId, { order: 'desc' });
      if (!responseMessages.data || responseMessages.data.length === 0) {
        return reply.status(500).send({
          message: 'No response was generated in the conversation thread.',
        });
      }
      // Extract the assistant's reply (ensure this matches the expected format).
      const answer = responseMessages.data[0].content;
      return reply.status(200).send({ answer, threadId });
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
      
      const answer = response.choices[0].message.content;
      return reply.status(200).send({ answer });
    }
    
  } catch (error: any) {
    console.error('Error in imageConversationController:', error);
    return reply.status(500).send({
      message: 'Error generating conversation response',
      error: error.message || error,
    });
  }
}
