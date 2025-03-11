import { FastifyRequest, FastifyReply } from 'fastify';
import OpenAI from 'openai';
import { streamToBuffer } from '../utils/streamToBuffer';
import { waitOnRunCompletion } from '../utils/waitOnRunComplete';
import FileType from 'file-type';
import { storeImageData, storeConversationData } from '../services/imageService';
import admin from '../config/firebase';
import * as giftService from '../services/giftService';
import { sendGiftBody } from '../types/interfaces';
import { getDownloadURL } from '../helpers/storage';




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
    const userEmail = (await admin.auth().getUser(userId)).email || '';
    console.log('userId', userId)
    console.log(userEmail)
  
    try {
      const gifts = await giftService.getReceivedGiftsService(userId, userEmail);
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
        console.log("Incoming request body:", JSON.stringify(request.body, null, 2)); // Debugging

        // Extract attributes correctly from request.body.data.attributes
        const attributes = (request.body as any).data?.attributes;
        
        if (!attributes) {
            return reply.status(400).send({ message: "Invalid request format" });
        }

        const {
            recipientId,
            name,
            email,
            phone = "Not Provided", // Default value if missing
            message = "Here's your gift!", // Default message if missing
            imageId,
            giftId,
            audioId
        } = attributes; // Extract fields from attributes

        // Ensure required fields are present
        if (!recipientId || !name || !email) {
            return reply.status(400).send({ message: "All fields are required" });
        }

        // Log extracted values for debugging
        console.log("Extracted attributes:", { recipientId, name, email, phone, message, imageId, giftId, audioId });

        // Create gift using service
        const gift = await giftService.sendGiftService(userId, attributes);
        return reply.status(201).send(gift);
    } catch (error: any) {
        console.error("Error processing gift request:", error);
        return reply.status(500).send({
            message: "Error sending gift",
            error: error.message || error,
        });
    }
}
