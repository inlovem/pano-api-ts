import { FastifyRequest, FastifyReply } from 'fastify';
import OpenAI from 'openai';

/**
 * Request body for generating an image description.
 */
interface ImageDescriptionRequestBody {
  // A publicly accessible image URL.
  image_url: string;
}

/**
 * Request body for the conversational route.
 */
interface ImageConversationRequestBody {
  // The full image description (generated earlier).
  imageDescription: string;
  // The user's follow-up question.
  question: string;
}

/**
 * Controller for generating a high-detail image description.
 *
 * This controller accepts an image URL, sends it to OpenAI with a high‑detail flag,
 * and returns the generated description.
 */
export async function generateImageDescriptionController(
  request: FastifyRequest<{ Body: ImageDescriptionRequestBody }>,
  reply: FastifyReply
) {
  const { image_url } = request.body;

  if (!image_url) {
    return reply.status(400).send({ message: 'The "image_url" field is required.' });
  }

  try {
    // Initialize the OpenAI client.
    const openai = new OpenAI();

    // Call the OpenAI Chat API with a multimodal prompt.
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: "Provide a high context description of the image?" },
            {
              type: 'image_url',
              image_url: {
                url: image_url,
                detail: 'high', // Request a high-detail description.
              },
            },
          ],
        },
      ],
      store: true,
    });

    // Ensure we have a valid response.
    if (!response.choices || response.choices.length === 0) {
      return reply.status(500).send({ message: 'No description was generated.' });
    }

    // Extract the generated image description.
    const imageDescription = response.choices[0].message.content;

    return reply.status(200).send({ imageDescription });
  } catch (error: any) {
    return reply.status(500).send({
      message: 'Error generating image description',
      error: error.message || error,
    });
  }
}

/**
 * Controller for having a conversation based on an image description.
 *
 * This controller accepts an image description and a user's question,
 * then uses the description as context to generate a conversational response.
 */
export async function imageConversationController(
  request: FastifyRequest<{ Body: ImageConversationRequestBody }>,
  reply: FastifyReply
) {
  let { imageDescription, question } = request.body;

  if (!imageDescription || !question) {
    return reply.status(400).send({
      message: 'Both "imageDescription" and "question" fields are required.',
    });
  }

  imageDescription = imageDescription.replace(/[\r\n]+/g, ' ').trim();
  question = question.replace(/[\r\n]+/g, ' ').trim();

  try {
    // Initialize the OpenAI client.
    const openai = new OpenAI();

    // Build the conversation context:
    // 1. A system message containing the image description.
    // 2. The user's question.
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Image description: ${imageDescription}`,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      store: true,
    });

    if (!response.choices || response.choices.length === 0) {
      return reply
        .status(500)
        .send({ message: 'No response was generated for the conversation.' });
    }

    // Extract the assistant's reply.
    const answer = response.choices[0].message.content;

    return reply.status(200).send({ answer });
  } catch (error: any) {
    return reply.status(500).send({
      message: 'Error generating conversation response',
      error: error.message || error,
    });
  }
}
