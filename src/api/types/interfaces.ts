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

export interface IRecording {
  toJSONAPIResourceObject: any;
  id: string;
  s3Key?: string;
  transcript?: string;
}