// src/controllers/conversationController.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import { ConversationService } from '../services/conversationService';
import { ResourceTypes } from '../../config/constants';
import { logInDevelopment } from '../../utils/logger';
import { downloadFile } from 'src/utils/fileDownloader';

interface CreateConversationMessageBody {
  data: {
    attributes: {
      s3Key?: string;
      text?: string;
      userId?: string;
    };
    id: string;
    type: string;
  };
}

interface CreatePhotoConversationBody {
  data: {
    attributes: {
      file: string; // Assuming this is a URL or file path
      photoId: string;
    };
    id: string;
    type: string;
  };
}

export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  /**
   * Handler for GET /photo-conversations/:photoId
   * Fetches all conversations related to a specific photo.
   */
  async getPhotoConversationsHandler(
    request: FastifyRequest<{ Params: { photoId: string } }>,
    reply: FastifyReply
  ) {
    const { photoId } = request.params;

    try {
      const conversations = await this.conversationService.fetchPhotoConversations(photoId);

      const data = await Promise.all(
        conversations.map(async (conversation) => {
          // Assuming toJSONAPIResourceObject is a method to serialize the conversation
          return await conversation.toJSONAPIResourceObject();
        })
      );

      reply.send({ data });
    } catch (error) {
      logInDevelopment('[500]', error);
      reply.status(500).send({ status: 500, error: 'Internal Server Error' });
    }
  }

  /**
   * Handler for POST /photo-conversations/:photoId
   * Creates a new conversation for a specific photo.
   */
  async createPhotoConversationHandler(
    request: FastifyRequest<{ Params: { photoId: string }; Body: CreatePhotoConversationBody }>,
    reply: FastifyReply
  ) {
    const { photoId } = request.params;
    const { data: { attributes = {}, type, id } = {} } = request.body;

    if (type !== ResourceTypes.CONVERSATION || String(id) !== String(photoId)) {
      return reply.status(409).send({
        errors: [{ status: '409', title: 'Unrecognized type or invalid id' }],
        status: 409,
      });
    }

    try {
      logInDevelopment('createPhotoConversation', attributes);

      // Step 1: Download the file from the URL (Assuming attributes.file is a URL)
      const filePath = `tmp/my-uploads/${attributes.photoId}.jpg`; // Adjust the path as needed
      await this.conversationService.downloadFile(attributes.file, filePath);

      // Step 2: Upload the file to OpenAI
      const file = await this.conversationService.uploadFileToOpenAI(filePath);

      logInDevelopment('Uploaded file:', file);

      // Step 3: Create a thread
      const thread = await this.conversationService.createThread();

      logInDevelopment('Created thread', thread);

      // Step 4: Create a message in the thread, including the image file
      const message = await this.conversationService.createThreadMessage(thread.id, file.id);

      logInDevelopment('Created message', message);

      // Step 5: Create Photo Conversation in DB
      const conversation = await this.conversationService.createPhotoConversation(photoId, thread.id);

      const resourceObject = await conversation.toJSONAPIResourceObject();

      reply.status(201).send(resourceObject);
    } catch (error) {
      logInDevelopment('[500]', error);
      reply.status(500).send({ status: 500, error: 'Internal Server Error' });
    }
  }

  /**
   * Handler for PATCH /photos/:photoId
   * Updates a user's photo.
   */
  async updateUserPhotoHandler(
    request: FastifyRequest<{ Params: { photoId: string }; Body: any }>,
    reply: FastifyReply
  ) {
    const user = request.user; // Assuming `user` is added to request via authentication
    if (!user?.isSuperuser) {
      return reply.status(403).send({
        errors: [{ status: '403', title: 'Unauthorized user' }],
        status: 403,
      });
    }

    const { photoId } = request.params;
    const { data: { attributes = {}, id, type } = {} } = request.body;

    if (type !== ResourceTypes.PHOTO || String(id) !== String(photoId)) {
      return reply.status(409).send({
        errors: [{ status: '409', title: 'Unrecognized type or invalid id' }],
        status: 409,
      });
    }

    try {
      const updatedPhoto = await this.conversationService.updateUserPhoto(user, photoId, attributes);

      if (updatedPhoto) {
        const resourceObject = await updatedPhoto.toJSONAPIResourceObject();
        reply.send(resourceObject);
      } else {
        reply.status(404).send({ status: 404, error: 'Photo not found' });
      }
    } catch (error) {
      logInDevelopment('[500]', error);
      reply.status(500).send({ status: 500, error: 'Internal Server Error' });
    }
  }
}
