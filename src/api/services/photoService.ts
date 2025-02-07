import prisma from '../prisma/client';
import { Prisma, Photo, User } from '@prisma/client';
import { getId } from '../utils/model';
import { logInDevelopment } from '../utils/logger';

interface Attributes {
  s3Key?: string;
}

export class PhotoService {
  /**
   * Fetches a user's photo.
   * @param user - The user object.
   * @param photo - The photo object or its ID.
   * @returns The Photo object or null if not found.
   */
  async fetchUserPhoto(user: User, photo: Photo | string): Promise<Photo | null> {
    const whereClause: Prisma.PhotoWhereUniqueInput = {
      id: getId(photo),
    };

    // Uncomment and adjust if you want to restrict by userId
    // if (!user.isSuperuser) {
    //   whereClause.userId = user.id;
    // }

    return prisma.photo.findUnique({
      where: whereClause,
    });
  }

  /**
   * Updates a user's photo.
   * @param user - The user object.
   * @param photo - The photo object or its ID.
   * @param newAttributes - Attributes to update.
   * @returns The updated Photo object or null if not found.
   */
  async updateUserPhoto(user: User, photo: Photo | string, newAttributes: Attributes): Promise<Photo | null> {
    const filteredAttributes: Prisma.PhotoUpdateInput = {
      s3Key: newAttributes.s3Key,
    };

    const existingPhoto = await this.fetchUserPhoto(user, photo);

    if (!existingPhoto) {
      return null;
    }

    return prisma.photo.update({
      where: {
        id: existingPhoto.id,
      },
      data: filteredAttributes,
    });
  }
}
