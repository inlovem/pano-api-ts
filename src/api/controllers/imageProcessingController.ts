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
          role: 'system',
          content: `You're a warm, curious conversation partner helping people capture the stories behind their cherished photos. 
    
    Think of yourself as part friend, part historian, and part storyteller. You notice emotional elements, ask thoughtful questions, and help draw out memories and meaning.
    
    Instead of just describing what you see, engage with the person about the emotional context, memories, and significance of their image. Respond as if you're sitting together looking at a photo album, with genuine interest in their story.
    
    Ask open-ended questions about the memory, the people, or the moment captured. Help them articulate what makes this image special enough to be gifted to someone else.
    
    Use a warm, conversational tone rather than analytical language.`
        },
        {
          role: 'user',
          content: [
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
    return reply.status(200).send({
        imageId,         // The unique image ID
        storagePath,     // The path where image is stored
        imageDescription // The LLM-generated description
      });

  } catch (error: any) {
    console.error('Error in generateImageDescriptionController:', error);
    return reply.status(500).send({
      message: 'Error generating image description',
      error: error.message || error,
    });
  }
}

export async function imageConversationController(
    request: FastifyRequest<{
      Body: {
        data: {
          type: string;
          attributes: {
            imageDescription: string;
            audioTranscript: string;
            question: string;
            threadId?: string;
          };
        };
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const {
        data: {
          attributes: { imageDescription, audioTranscript, question, threadId },
        },
      } = request.body;
  
      console.log("User question:", question);
      console.log("Image description:", imageDescription);
      console.log("Audio transcript:", audioTranscript);
  
      const userId = (request as any).user.uid as string;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const assistantId = process.env.OPENAI_ASSISTANT_ID as string;
  
      // --- Thread-Based Conversation Mode ---
      if (threadId) {
        const userMessage = {
          role: 'user' as const,
          content: `CONTEXT:\nImage Description: ${imageDescription}\nTranscript: ${audioTranscript}\n\nQUESTION: ${question}`,
        };
        await openai.beta.threads.messages.create(threadId, userMessage);
  
        const run = await openai.beta.threads.runs.create(threadId, {
          assistant_id: assistantId,
        });
  
        await waitOnRunCompletion(openai, run.id, threadId);
  
        const responseMessages = await openai.beta.threads.messages.list(threadId, {
          order: 'desc',
        });
  
        if (!responseMessages.data?.length) {
          return reply
            .status(500)
            .send({ message: 'No response was generated in the conversation thread.' });
        }
  
        const rawAnswer = responseMessages.data[0].content;
        const answerStr = Array.isArray(rawAnswer) ? rawAnswer.join(' ') : rawAnswer ?? '';
  
        await storeConversationData(userId, threadId, {
          reference: `conversations/${threadId}`,
          messages: [question, answerStr],
        });
  
        // Return response wrapped in a "data" object
        return reply.status(200).send({
          data: {
            type: "imageConversation",
            attributes: {
              answer: answerStr,
            },
          },
        });
      }
  
      // --- Simple Chat Completion Mode ---
      else {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini', // or 'gpt-4'
          messages: [
            {
              role: 'system',
              content:
                `You have two pieces of context:\n` +
                `Image Description: ${imageDescription}\n` +
                `Transcript: ${audioTranscript}\n` +
                `Respond to user queries using both.`,
            },
            { role: 'user', content: question },
          ],
          store: true,
        });
  
        if (!response.choices?.length) {
          return reply
            .status(500)
            .send({ message: 'No response was generated for the conversation.' });
        }
  
        const rawAnswerSimple = response.choices[0].message.content;
        const answerStrSimple = Array.isArray(rawAnswerSimple)
          ? rawAnswerSimple.join(' ')
          : rawAnswerSimple ?? '';
  
        const conversationId = Date.now().toString();
        await storeConversationData(userId, conversationId, {
          reference: `conversations/${conversationId}`,
          messages: [question, answerStrSimple],
        });
  
        // Return response wrapped in a "data" object
        return reply.status(200).send({
          data: {
            type: "imageConversation",
            attributes: {
              answer: answerStrSimple,
            },
          },
        });
      }
    } catch (error: any) {
      console.error('Error in imageConversationController:', error);
      return reply.status(500).send({
        message: 'Error generating conversation response',
        error: error.message || error,
      });
    }
  }
  

