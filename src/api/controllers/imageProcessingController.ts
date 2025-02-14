import { FastifyRequest, FastifyReply } from 'fastify';
import OpenAI from 'openai';
import { streamToBuffer } from '../utils/streamToBuffer';
import { waitOnRunCompletion } from '../utils/waitOnRunComplete';
import FileType from 'file-type';
import { storeImageData, storeConversationData } from '../services/imageService';
import admin from '../config/firebase';

/**
 * Controller for generating a high-detail image description.
 * Uses Fastify's built-in multipart file() method (in-memory).
 */

export async function generateImageDescriptionController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = (request as any).user.uid as string;
    const file = await request.file();

    if (!file) {
      console.error('No file was uploaded.');
      return reply.status(400).send({ message: 'File is required.' });
    }

    //Convert file stream to Buffer
    const fileBuffer = await streamToBuffer(file.file);

    //  MIME type from buffer or fallback to the file's mimetype
    const fileTypeResult = await FileType.fromBuffer(fileBuffer);
    const mimetype = fileTypeResult?.mime || file.mimetype || 'application/octet-stream';

    // 3) Upload the buffer to Firebase Storage
    const bucket = admin.storage().bucket();
    const imageId = Date.now().toString();
    const storagePath = `images/${userId}/${imageId}`;
    
    const savedFile = bucket.file(storagePath);
    await savedFile.save(fileBuffer, {
      metadata: { contentType: mimetype }
    });
    console.log('Uploaded file to Storage path:', storagePath);

    // store only the storagePath
    await storeImageData(userId, imageId, { resource_url: storagePath });
    console.log('Stored image reference in RTDB at /users/%s/images/%s', userId, imageId);

    const base64Image = fileBuffer.toString('base64');
    const dataUrl = `data:${mimetype};base64,${base64Image}`;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

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
    })


    if (!response.choices?.length) {
      return reply.status(500).send({ message: 'No description was generated.' });
    }

    const imageDescription = response.choices[0].message.content;
    console.log('Generated image description:', imageDescription);
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
 * The user supplies text: { imageDescription, question, threadId? }
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
  const cleanedImageDescription = imageDescription.replace(/[\r\n]+/g, ' ').trim();
  const cleanedQuestion = question.replace(/[\r\n]+/g, ' ').trim();

  try {
    
    const userId = (request as any).user.uid as string;

    // Use your desired OpenAI model & calls
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const assistantId = process.env.OPENAI_ASSISTANT_ID as string;

    // --- Thread-Based Conversation Mode ---
    if (threadId) {
      // 1) Add a user message to the thread
      const userMessage = { role: 'user' as const, content: cleanedQuestion };
      await openai.beta.threads.messages.create(threadId, userMessage);

      // 2) Start a new 'run' using your assistant ID
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      });

      // 3) Wait for run completion
      await waitOnRunCompletion(openai, run.id, threadId);

      // 4) Retrieve the updated thread messages (descending order)
      const responseMessages = await openai.beta.threads.messages.list(threadId, { order: 'desc' });
      if (!responseMessages.data?.length) {
        return reply.status(500).send({ message: 'No response was generated in the conversation thread.' });
      }

      // The newest assistant message is the reply
      const rawAnswer = responseMessages.data[0].content;
      const answerStr = Array.isArray(rawAnswer) ? rawAnswer.join(' ') : (rawAnswer ?? '');

      // Store conversation data
      await storeConversationData(userId, threadId, {
        reference: `conversations/${threadId}`,
        messages: [cleanedQuestion, answerStr],
      });

      return reply.status(200).send({ answer: answerStr, threadId });
    }

    // --- Simple Chat Completion Mode ---
    else {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `Image description: ${cleanedImageDescription}` },
          { role: 'user', content: cleanedQuestion },
        ],
        store: true,
      });

      if (!response.choices?.length) {
        return reply.status(500).send({ message: 'No response was generated for the conversation.' });
      }

      const rawAnswerSimple = response.choices[0].message.content;
      const answerStrSimple = Array.isArray(rawAnswerSimple)
        ? rawAnswerSimple.join(' ')
        : (rawAnswerSimple ?? '');

      // Generate a new conversation ID
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
