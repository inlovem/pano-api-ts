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
