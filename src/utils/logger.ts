export function logInDevelopment(...args: any[]) {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  }
  