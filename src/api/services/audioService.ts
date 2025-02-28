import admin from '../config/firebase';
import FileType from 'file-type';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

export async function processAudioTranscription(
  userId: string,
  fileBuffer: Buffer,
  defaultMimeType: string
) {
  // 1) Determine the correct MIME type
  const fileTypeResult = await FileType.fromBuffer(fileBuffer);
  const mimetype = fileTypeResult?.mime || defaultMimeType || 'application/octet-stream';


  const audioDocRef = admin.firestore().collection('audio').doc();
  const audioId = audioDocRef.id; // Use this ID for both Storage and Firestore

  // 2) Generate a unique audio ID and define the Firebase Storage path
  // const audioId = Date.now().toString();

  const storagePath = `recordings/${userId}/${audioId}`;
  const bucket = admin.storage().bucket();
  const savedFile = bucket.file(storagePath);

  // 3) Upload to Firebase Storage
  await savedFile.save(fileBuffer, {
    metadata: { contentType: mimetype },
  });

  // 4) Write buffer to a temp file on your server (e.g., /tmp for ephemeral usage)
  const tempFilePath = path.join('/tmp', `audio_${audioId}.wav`);
  await fs.promises.writeFile(tempFilePath, fileBuffer);


  // 5) Create a standard fs read stream
  const readStream = fs.createReadStream(tempFilePath);


  // 6) Instantiate OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // 7) Call Whisper transcription
  const transcriptionResponse = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: readStream, // <--- Pass the read stream
  });

  const transcriptionText = transcriptionResponse.text;

  // 8) Save metadata + transcription in Firestore
  const audioData = {
    audioPath: storagePath,
    transcription: transcriptionText,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  const audioRef = await admin.firestore().collection('audio').add(audioData);
  const audioSnapshot = await audioRef.get();


  await audioDocRef.set(audioData);

  return { id: audioDocRef.id, ...audioData };
}
