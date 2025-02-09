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