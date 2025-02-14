import { FastifyRequest, FastifyReply } from 'fastify';
import OpenAI from 'openai';
import { streamToBuffer } from '../utils/streamToBuffer';
import { waitOnRunCompletion } from '../utils/waitOnRunComplete';
import FileType from 'file-type';
import { storeImageData, storeConversationData } from '../services/imageService';
import admin from '../config/firebase';
import * as giftService from '../services/giftService';
import { sendGiftBody } from '../types/interfaces';



export async function getSentGiftsController(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const userId = (request as any).user.uid as string;
  
    try {
      const gifts = await giftService.getSentGiftsService(userId);
      return reply.status(200).send(gifts);
    } catch (error: any) {
      return reply
        .status(500)
        .send({ message: 'Error retrieving sent gifts', error: error.message || error });
    }
  }
  
  // Controller: Retrieve all gifts that a user has received
  export async function getReceivedGiftsController(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const userId = (request as any).user.uid as string;
  
    try {
      const gifts = await giftService.getReceivedGiftsService(userId);
      return reply.status(200).send(gifts);
    } catch (error: any) {
      return reply
        .status(500)
        .send({ message: 'Error retrieving received gifts', error: error.message || error });
    }
  }



export async function createGiftController(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const userId = (request as any).user.uid as string;
  
    try {
      const {
        recipientId,
        name,
        email,
        phone,
        message,
        imageId,
        giftId,
        audioId,
      } = request.body as sendGiftBody;
  
      if (!recipientId || !name || !email || !phone || !message) {
        return reply.status(400).send({ message: 'All fields are required' });
      }
  
      const gift = await giftService.sendGiftService(userId, request.body as sendGiftBody);
      return reply.status(201).send(gift);
    } catch (error: any) {
      return reply.status(500).send({
        message: 'Error sending gift',
        error: error.message || error,
      });
    }
  }
