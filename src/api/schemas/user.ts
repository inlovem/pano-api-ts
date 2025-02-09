// src/api/schemas/user.ts
export interface UserMetadata {
    creationTime: string;
    lastSignInTime: string;
}

export interface UserInfo {
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    photoURL?: string;
    providerId: string;
    uid: string;
}

export interface User {
    /** Already existing fields **/
    emailVerified: boolean;
    isAnonymous: boolean;
    metadata: UserMetadata;
    providerData: UserInfo[];
    refreshToken: string;
    tenantId: string | null;
    interactions: string[];

    /** Additional top-level properties (optional) **/
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    photoURL?: string;
}
