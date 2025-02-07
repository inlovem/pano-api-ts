import { FastifyRequest, FastifyReply } from 'fastify';
import path from 'path';
import fs from 'fs';
import { resourceTypes } from '../config/constants';
import openai from '../services/openaiService';
import { downloadFile } from '../utils/fileDownloader';
import { logInDevelopment } from '../utils/logger';

// Define the shape of your service
interface Service {
  fetchPhotoConversations: (photoId: string) => Promise<any[]>;
  createPhotoConversation: (photoId: string, threadId: string) => Promise<any>;
}

// GET handler
export async function getPhotoConversationsHandler(
  request: FastifyRequest<{ Params: { photoId: string } }>,
  reply: FastifyReply,
  service: Service
) {
  const { photoId } = request.params;

  try {
    const conversations = await service.fetchPhotoConversations(photoId);

    const data = await Promise.all(conversations.map(async (conversation) => {
      const resourceObject = await conversation.toJSONAPIResourceObject();
      return resourceObject.data;
    }));

    reply.jsonAPI({ data });
  } catch (e) {
    console.error('[500]', e);
    reply.jsonAPI({ status: 500 });
  }
}

// POST handler
export async function postPhotoConversationsHandler(
  request: FastifyRequest<{ Params: { photoId: string }; Body: any }>,
  reply: FastifyReply,
  service: Service
) {
  const { photoId } = request.params;
  const { data: { attributes = {}, type } = {} } = request.body;

  if (type === resourceTypes.CONVERSATION) {
    logInDevelopment('createPhotoConversation', attributes);

    try {
      // Step 1: Download the file from the URL
      const filePath = path.join(__dirname, '..', '..', 'tmp', 'my-uploads', `${attributes.photoId}.jpg`);
      await downloadFile(attributes.file, filePath);

      // Step 2: Upload the file to OpenAI
      const file = await openai.files.create({
        file: fs.createReadStream(filePath),
        purpose: 'vision',
      });

      logInDevelopment('Uploaded file:', file);

      // Step 3: Create a thread
      const thread = await openai.beta.threads.create();
      logInDevelopment("Created thread", thread);

      // Step 4: Create a message in the thread, including the image file
      const message = await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: [
          {
            type: 'image_file',
            image_file: {
              file_id: file.id,
            },
          },
        ],
      });
      logInDevelopment("Created message", message);

      // Step 5: Create Photo Conversation
      const conversation = await service.createPhotoConversation(photoId, thread.id);
      const resourceObject = await conversation.toJSONAPIResourceObject();
      reply.jsonAPI(resourceObject);
    } catch (e) {
      console.error('[500]', e);
      reply.jsonAPI({ status: 500 });
    }
  } else {
    reply.jsonAPI({
      errors: [{ status: '409', title: 'Unrecognized type' }],
      status: 409,
    });
  }
}
