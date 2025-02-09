// src/api/services/authService.ts

import admin from '../config/firebase';
import axios from 'axios';
import {
  CreateUserInput,
  LoginUserInput,
  UpdateProfileInput,
  SocialLoginInput,
} from '../types/interfaces';

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

  try {
    const response = await axios.post(url, {
      email,
      password,
      returnSecureToken: true,
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error.message);
    }
    throw error;
  }
}

/**
 * Updates a user's profile information.
 */
export async function updateUserProfile(input: UpdateProfileInput) {
  const { uid, displayName, photoURL } = input;
  try {
    return await admin.auth().updateUser(uid, {
      displayName,
      photoURL,
    });
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
  const encodedToken = encodeURIComponent(token);

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
    requestUri: 'http://localhost', // Can be any valid URL.
    returnSecureToken: true,
    returnIdpCredential: true,
  };

  try {
    const response = await axios.post(url, payload);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error.message);
    }
    throw error;
  }
}
