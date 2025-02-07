import prisma from '../prisma/client';
import { Prisma, Conversation, ConversationMessage, Photo } from '@prisma/client';
import { getId } from '../../utils/model';
import { logInDevelopment } from '../utils/logger';

interface Attributes {
  s3Key?: string;
  text?: string;
  userId?: string;
}

export class ConversationService {
  /**
   * Creates a new conversation message.
   * @param conversation - The conversation object or its ID.
   * @param attributes - Attributes for the message.
   * @returns The created ConversationMessage.
   */
  async createConversationMessage(conversation: Conversation | string, attributes: Attributes): Promise<ConversationMessage> {
    const filteredAttributes: Prisma.ConversationMessageCreateInput = {
      conversationId: getId(conversation),
      s3Key: attributes.s3Key,
      text: attributes.text,
      userId: attributes.userId!,
    };

    return prisma.conversationMessage.create({
      data: filteredAttributes,
    });
  }

  /**
   * Creates a new conversation for a photo.
   * @param photo - The photo object or its ID.
   * @param threadId - The thread ID.
   * @returns The created Conversation.
   */
  async createPhotoConversation(photo: Photo | string, threadId: string): Promise<Conversation> {
    return prisma.conversation.create({
      data: {
        photoId: getId(photo),
        threadId: threadId,
      },
    });
  }

  /**
   * Fetches all messages for a conversation.
   * @param conversation - The conversation object or its ID.
   * @returns An array of ConversationMessages.
   */
  async fetchConversationMessages(conversation: Conversation | string): Promise<ConversationMessage[]> {
    return prisma.conversationMessage.findMany({
      where: {
        conversationId: getId(conversation),
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Fetches all conversations for a photo.
   * @param photo - The photo object or its ID.
   * @returns An array of Conversations.
   */
  async fetchPhotoConversations(photo: Photo | string): Promise<Conversation[]> {
    return prisma.conversation.findMany({
      where: {
        photoId: getId(photo),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Fetches a conversation by its ID.
   * @param conversationId - The ID of the conversation.
   * @returns The Conversation object or null if not found.
   */
  async fetchConversation(conversationId: string): Promise<Conversation | null> {
    return prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });
  }
}
