
import admin from '../config/firebase';
import { sendGiftBody } from '../types/interfaces';
import { getDownloadURL } from '../helpers/storage';


export async function sendGiftService(userId: string, giftBody: sendGiftBody) {

    const imagePath = `images/${userId}/${giftBody.imageId}`;
    const audioPath = `recordings/${userId}/${giftBody.audioId}`;
  

    const giftData = {
      senderId: userId,
      name: giftBody.name,
      email: giftBody.email,
      phone: giftBody.phone,
      message: giftBody.message || "", // Keep message if text exists
      imagePath,
      audioPath,
      // audioPath: giftBody.audioId ? audioPath : null, // Store audioPath only if audio exists
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
  

    const giftRef = await admin.firestore().collection('gifts').add(giftData);
  
    const giftSnapshot = await giftRef.get();
    return { id: giftRef.id, ...giftSnapshot.data() };
  }


  
  export async function getSentGiftsService(userId: string) {
    const userEmail = (await admin.auth().getUser(userId)).email;
    const sentGiftsSnapshot = await admin
      .firestore()
      .collection('gifts')
      .where('email', '==', userEmail)
      .get();
  
    const sentGiftsData = await Promise.all(
      sentGiftsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        // Generate the signed URL for the image and audio.
        const imageUrl = await getDownloadURL(data.imagePath);
        // Ensure that data.audioPath exactly matches the file path in Storage.
        const audioUrl = data.audioPath ? await getDownloadURL(data.audioPath) : '';
  
        return {
          id: doc.id,
          ...data,
          imageUrl,
          audioUrl,
        };
      })
    );
  
    return sentGiftsData;
  }
  
  
  // Service: Query all gifts a particular user has received
  export async function getReceivedGiftsService(userId: string) {
    const receivedGiftsSnapshot = await admin
      .firestore()
      .collection('gifts')
      .where('recipientId', '==', userId)
      .get();
  
    const receivedGiftsData = receivedGiftsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Reconstruct storage paths for consistency if not stored:
        // imagePath: `images/${data.senderId}/${data.imageId}`,
        // audioPath: `recordings/${data.senderId}/${data.audioId}`,
      };
    });
    return receivedGiftsData;
  }
