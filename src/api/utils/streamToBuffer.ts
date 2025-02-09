// src/utils/streamToBuffer.ts

/**
 * Converts a readable stream into a Buffer.
 *
 * @param stream - A NodeJS.ReadableStream to convert.
 * @returns A Promise that resolves with the concatenated Buffer.
 */

export async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => {
        // Ensure chunk is a Buffer (convert if it's a string)
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      });
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
  