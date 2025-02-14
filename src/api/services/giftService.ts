
import admin from '../config/firebase';
import { sendGiftBody } from '../types/interfaces';

export async function sendGiftService(userId: string, giftBody: sendGiftBody) {

    const imagePath = `images/${userId}/${giftBody.imageId}`;
    const audioPath = `recordings/${userId}/${giftBody.audioId}`;
  

    const giftData = {
      ...giftBody,
      senderId: userId,
      imagePath,
      audioPath,
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
  
    // Map Firestore documents to a usable array and reconstruct storage paths if needed
    const sentGiftsData = sentGiftsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Reconstruct storage paths for consistency if not stored:
        // imagePath: `images/${data.senderId}/${data.imageId}`,
        // audioPath: `recordings/${data.senderId}/${data.audioId}`,
      };
    });
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
