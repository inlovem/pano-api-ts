import { FastifyRequest, FastifyReply } from 'fastify';
import { processAudioTranscription } from '../services/audioService';
import { streamToBuffer } from '../utils/streamToBuffer';

export async function processAudioTranscriptionController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {

    const userId = (request as any).user.uid as string;
    const file = await request.file();

    if (!file) {
      return reply.status(400).send({ message: 'Audio file is required.' });
    }


    const fileBuffer = await streamToBuffer(file.file);

    
    const result = await processAudioTranscription(userId, fileBuffer, file.mimetype);
    return reply.status(200).send(result);
  } catch (error: any) {
    console.error('Error in processAudioTranscriptionController:', error);
    return reply.status(500).send({
      message: 'Error processing audio transcription',
      error: error.message || error,
    });
  }
}
