import admin from '../config/firebase';
import FileType from 'file-type';
import streamifier from 'streamifier';
import OpenAI from 'openai';

export async function processAudioTranscription(
  userId: string,
  fileBuffer: Buffer,
  defaultMimeType: string
) {

  const fileTypeResult = await FileType.fromBuffer(fileBuffer);
  const mimetype = fileTypeResult?.mime || defaultMimeType || 'application/octet-stream';

  // Generate a unique audio ID and define the Firebase Storage path
  const audioId = Date.now().toString();
  const storagePath = `recordings/${userId}/${audioId}`;
  const bucket = admin.storage().bucket();
  const savedFile = bucket.file(storagePath);

    // Upload the buffer to Firebase Storage
  await savedFile.save(fileBuffer, {
    metadata: { contentType: mimetype },
  });
  console.log('Uploaded audio file to Storage at:', storagePath);

  // Convert the buffer back into a stream for transcription
  const audioStream = streamifier.createReadStream(fileBuffer);

  // Instantiate OpenAI client using your existing style
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Invoke OpenAI's Whisper transcription API using a similar pattern as your image controller
  const transcriptionResponse = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: audioStream as unknown as File, // Adjust type as necessary per SDK requirements
  });
  const transcriptionText = transcriptionResponse.text;
  console.log('Transcription text:', transcriptionText);

  // Save audio metadata and transcription in Firestore
  const audioData = {
    audioPath: storagePath,
    transcription: transcriptionText,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const audioRef = await admin.firestore().collection('audio').add(audioData);
  const audioSnapshot = await audioRef.get();

  return { id: audioRef.id, ...audioSnapshot.data() };
}
