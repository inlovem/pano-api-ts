// src/controllers/photoController.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import { PhotoService } from '../services/photoService';
import { logInDevelopment } from '../../utils/logger';

interface UpdateUserPhotoBody {
  data: {
    attributes: {
      s3Key?: string;
      // Add other attributes as needed
    };
    id: string;
    type: string;
  };
}

interface User {
  id: string;
  isSuperuser: boolean;
  // Add other user properties as needed
}

export class PhotoController {
  constructor(private photoService: PhotoService) {}

  /**
   * Handler for PATCH /photos/:photoId
   * Updates a user's photo.
   */
  async updateUserPhotoHandler(
    request: FastifyRequest<{ Params: { photoId: string }; Body: UpdateUserPhotoBody }>,
    reply: FastifyReply
  ) {
    const user = request.user as User; // Assuming `user` is added to request via authentication
    if (!user?.isSuperuser) {
      return reply.status(403).send({
        errors: [{ status: '403', title: 'Unauthorized user' }],
        status: 403,
      });
    }

    const { photoId } = request.params;
    const { data: { attributes = {}, id, type } = {} } = request.body;

    if (type !== 'photo' || String(id) !== String(photoId)) {
      return reply.status(409).send({
        errors: [{ status: '409', title: 'Unrecognized type or invalid id' }],
        status: 409,
      });
    }

    try {
      logInDevelopment('updateUserPhoto', attributes);

      const updatedPhoto = await this.photoService.updateUserPhoto(user, photoId, attributes);

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
