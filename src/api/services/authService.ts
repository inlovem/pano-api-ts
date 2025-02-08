// src/api/services/authService.ts

import admin from 'firebase-admin';

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

/**
 * Registers a new user in Firebase Authentication.
 */
export async function registerUser(input: CreateUserInput) {
    const { email, password } = input;
    try {
        return await admin.auth().createUser({
            email,
            password,
        });
    } catch (error) {
        throw error;
    }
}

/**
 * Logs in a user with email and password using Firebase's REST API.
 * Ensure that FIREBASE_API_KEY is set in your environment variables.
 */
export async function loginUser(input: LoginUserInput) {
    const { email, password } = input;
    const API_KEY = process.env.FIREBASE_API_KEY;
    if (!API_KEY) {
        throw new Error('FIREBASE_API_KEY is not defined in environment variables.');
    }
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error.message);
    }
    return await response.json();
}

/**
 * Updates a user's profile information.
 */
export async function updateUserProfile(input: UpdateProfileInput) {
    const { uid, displayName, photoURL } = input;
    try {
        return await admin.auth().updateUser(uid, {displayName, photoURL});
    } catch (error) {
        throw error;
    }
}

/**
 * Logs in a user using a social provider (Google, Apple, Facebook) via Firebase's Identity Toolkit.
 */
export async function loginWithSocial(input: SocialLoginInput) {
    const { token, providerId } = input;
    const API_KEY = process.env.FIREBASE_API_KEY;
    if (!API_KEY) {
        throw new Error('FIREBASE_API_KEY is not defined in environment variables.');
    }

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${API_KEY}`;

    // Properly encode the token to handle any special characters.
    const encodedToken = encodeURIComponent(token);

    // Build the postBody based on the provider.
    // For Google and Apple, the token is assumed to be an ID token.
    // For Facebook, the token is assumed to be an access token.
    let postBody = '';
    if (providerId === 'google.com' || providerId === 'apple.com') {
        postBody = `id_token=${encodedToken}&providerId=${providerId}`;
    } else if (providerId === 'facebook.com') {
        postBody = `access_token=${encodedToken}&providerId=${providerId}`;
    } else {
        throw new Error('Unsupported provider');
    }

    const payload = {
        postBody,
        requestUri: 'http://localhost', // This can be any valid URL.
        returnSecureToken: true,
        returnIdpCredential: true,
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error.message);
    }

    return await response.json();
}
