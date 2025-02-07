const cognitoGroups = {
	SUPERUSERS: 'Superusers'
};

const providers = {
	APPLE: 'apple',
	GOOGLE: 'google',
	FACEBOOK: 'facebook',
	FIREBASE: 'firebase',
};

const ResourceTypes = {
	CONVERSATION: 'conversation',
	CONVERSATION_MESSAGE: 'conversationMessage',
	PHOTO: 'photo',
	POSTCARD: 'postcard',
	RECIPIENT: 'recipient',
	RECORDING: 'recording',
	SESSION: 'session',
	TRANSACTION: 'transaction',
	TRANSACTION_ITEM: 'transactionItem',
	USER: 'user'
};

const tableNames = {
	CONVERSATION: 'conversation',
	CONVERSATION_MESSAGE: 'conversation_message',
	GIFTABLE_RECIPIENT: 'giftable_recipient',
	PHOTO: 'photo',
	POSTCARD: 'postcard',
	RECIPIENT: 'recipient',
	RECORDING: 'recording',
	TRANSACTION: 'transaction',
	TRANSACTION_ITEM: 'transaction_item'
};

// src/constants/constants.ts
// Purpose: Contains the constants used in the application.


export const responseProperty = {
    message: {
      type: 'string',
    },
  }
  
  export const ERROR400 = {
    description: 'Bad request',
    type: 'object',
    properties: responseProperty,
  }
  
  /**
   * Represents the 401 error response object.
   */
  export const ERROR401 = {
    description: 'Unauthorized',
    type: 'object',
    properties: responseProperty,
  }
  
  export const ERROR403 = {
    description: 'Forbidden Request',
    properties: responseProperty,
  }
  
  export const ERROR404 = {
    description: 'Not found',
    properties: responseProperty,
  }
  
  export const ERROR409 = {
    description: 'Conflict',
    properties: responseProperty,
  }
  
  export const ERROR500 = {
    description: 'Internal Sever Error',
    properties: responseProperty,
  }
  


export { cognitoGroups, providers, ResourceTypes, tableNames };