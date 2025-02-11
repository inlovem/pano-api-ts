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
  uid: string;
  isSuperuser?: boolean;
  
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


export interface ImageDescriptionRequestBody {
  // A base64-encoded image string (e.g., "data:image/png;base64,....")
  image_base64: string;
}

/**
* Request body for the conversational route.
*/
export interface ImageConversationRequestBody {
  // The full image description (generated earlier).
  imageDescription: string;
  // The user's follow-up question.
  question: string;
}
