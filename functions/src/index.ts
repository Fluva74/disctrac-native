import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import fetch from "node-fetch";

admin.initializeApp();

export const sendPushNotification = functions.firestore
  .document("messages/{messageId}")
  .onCreate(async (snap, context) => {
    try {
      const message = snap.data();
      const { receiverId, senderId, message: messageText, senderName } = message;

      // Don't send notification if sender is receiver
      if (senderId === receiverId) {
        console.log("Sender is receiver, skipping notification");
        return null;
      }

      // Get receiver's profile - check both players and stores collections
      let receiverDoc = await admin.firestore()
        .collection("players")
        .doc(receiverId)
        .get();

      if (!receiverDoc.exists) {
        receiverDoc = await admin.firestore()
          .collection("stores")
          .doc(receiverId)
          .get();
      }

      if (!receiverDoc.exists) {
        console.log("Receiver doc not found in either collection");
        return null;
      }

      const receiverData = receiverDoc.data();
      
      // Check if receiver has notifications enabled
      if (!receiverData?.contactPreferences?.phone) {
        console.log("Phone notifications disabled for receiver");
        return null;
      }

      // Get receiver's push token
      const pushToken = receiverData.expoPushToken;
      if (!pushToken) {
        console.log("No push token found for receiver");
        return null;
      }

      // Send push notification via Expo's push service
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: pushToken,
          title: `New Message from ${senderName}`,
          body: messageText,
          sound: "default",
          data: { 
            type: "message",
            senderId,
            messageId: context.params.messageId
          },
        }),
      });

      console.log("Push notification sent:", response.status);
      return null;
    } catch (error) {
      console.error("Error sending push notification:", error);
      return null;
    }
  }); 