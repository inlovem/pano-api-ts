export interface CreateUserInput {
    email: string;
    password: string;
}

export interface LoginUserInput {
    email: string;
    password: string;
}

export interface SocialLoginInput {
    token: string;
    // Only these three providers are allowed
    providerId: 'google.com' | 'apple.com' | 'facebook.com';
}

export interface UpdateProfileInput {
    uid: string;
    displayName?: string;
    photoURL?: string;
}

export interface LoginRequestBody {
    email: string;
    password: string;
}

export interface RegisterRequestBody {
    email: string;
    password: string;
}

export interface UpdateProfileRequestBody {
    displayName?: string;
    photoURL?: string;
}


export interface SocialLoginRequestBody {
    token: string;
}

export interface IUser {
  isSuperuser?: boolean;
  uid?: string;
}

export interface IUpdateRecordingBody {
    data: {
      id: string;
      type: 'recording';
      attributes?: {
        [key: string]: any; // e.g., { title: string; description: string; }
      };
    };
  }

export interface IUpdateRecordingParams {
    recordingId: string;
  }

export interface IRecording {
  toJSONAPIResourceObject: any;
  id: string;
  s3Key?: string;
  transcript?: string;
}

export interface IPostcard {
    id?: string;
    userId?: string;
    recipientId?: string;
    s3Key?: string;
    transcript?: string;
  }


export interface IUpdatePostCardBody {
    data: {
        id: string;
        type: 'postCard';
        attributes?: {
            [key: string]: any;
        };
    };
}
export interface IUpdatePostCardParams {
    postCardId: string;
}

export interface IUserData {
    uid: string;
    username: string;
    email: string;
    profile_picture: string;
    phone_number: string;
    created_at: string;
    added_to_postcards: string[];   // List of postcard IDs added by other users
    created_postcards: string[];    // List of postcard IDs created by the user
}

export interface IndexedImage {
    resource_url: string;
    conversation_id?: string; // Firestore conversation reference
    audio_id?: string;
    message_reference?: string;
}

export interface IndexedConversation {
    reference: string;       // Firestore document reference (e.g., "conversations/conv_789")
    messages: string[];      // Array of message IDs
}

// Example: a user lookup index for images and conversations
export interface UserIndex {
    images?: {
        [imageId: string]: IndexedImage;
    };
    conversations?: {
        [conversationId: string]: IndexedConversation;
    };
}



export interface User {
    uid: string;
    email: string;
    email_verified: boolean;
    displayName: string;
    photoURL: string;
    providerId: string;
    createdAt: Date;
    updatedAt: Date;
}



export interface sendGiftBody {
    recipientId: string;
    name : string;
    email : string;
    phone : string;
    message?: string | null;
    imageId : string;
    giftId : string;
    audioId : string;
}


