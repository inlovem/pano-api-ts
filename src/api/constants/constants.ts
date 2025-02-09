// src/constants/constants.ts
export const responseProperty = {
  message: {
    type: 'string',
  },
}

/* Client Errors (4xx) */
export const ERROR400 = {
  description: 'Bad Request',
  type: 'object',
  properties: responseProperty,
};

export const ERROR401 = {
  description: 'Unauthorized',
  type: 'object',
  properties: responseProperty,
};

export const ERROR402 = {
  description: 'Payment Required',
  type: 'object',
  properties: responseProperty,
};

export const ERROR403 = {
  description: 'Forbidden',
  type: 'object',
  properties: responseProperty,
};

export const ERROR404 = {
  description: 'Not Found',
  type: 'object',
  properties: responseProperty,
};

export const ERROR405 = {
  description: 'Method Not Allowed',
  type: 'object',
  properties: responseProperty,
};

export const ERROR406 = {
  description: 'Not Acceptable',
  type: 'object',
  properties: responseProperty,
};

export const ERROR407 = {
  description: 'Proxy Authentication Required',
  type: 'object',
  properties: responseProperty,
};

export const ERROR408 = {
  description: 'Request Timeout',
  type: 'object',
  properties: responseProperty,
};

export const ERROR409 = {
  description: 'Conflict',
  type: 'object',
  properties: responseProperty,
};

export const ERROR410 = {
  description: 'Gone',
  type: 'object',
  properties: responseProperty,
};

export const ERROR411 = {
  description: 'Length Required',
  type: 'object',
  properties: responseProperty,
};

export const ERROR412 = {
  description: 'Precondition Failed',
  type: 'object',
  properties: responseProperty,
};

export const ERROR413 = {
  description: 'Payload Too Large',
  type: 'object',
  properties: responseProperty,
};

export const ERROR414 = {
  description: 'URI Too Long',
  type: 'object',
  properties: responseProperty,
};

export const ERROR415 = {
  description: 'Unsupported Media Type',
  type: 'object',
  properties: responseProperty,
};

export const ERROR416 = {
  description: 'Range Not Satisfiable',
  type: 'object',
  properties: responseProperty,
};

export const ERROR417 = {
  description: 'Expectation Failed',
  type: 'object',
  properties: responseProperty,
};

export const ERROR422 = {
  description: 'Unprocessable Entity',
  type: 'object',
  properties: responseProperty,
};

export const ERROR429 = {
  description: 'Too Many Requests',
  type: 'object',
  properties: responseProperty,
};

/* Server Errors (5xx) */
export const ERROR500 = {
  description: 'Internal Server Error',
  type: 'object',
  properties: responseProperty,
};

export const ERROR501 = {
  description: 'Not Implemented',
  type: 'object',
  properties: responseProperty,
};

export const ERROR502 = {
  description: 'Bad Gateway',
  type: 'object',
  properties: responseProperty,
};

export const ERROR503 = {
  description: 'Service Unavailable',
  type: 'object',
  properties: responseProperty,
};

export const ERROR504 = {
  description: 'Gateway Timeout',
  type: 'object',
  properties: responseProperty,
};
