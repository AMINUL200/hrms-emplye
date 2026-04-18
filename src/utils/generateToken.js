import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";

export const generateToken = async () => {
  try {
    if (Notification.permission === "denied") {
      console.log("User already denied notifications");
      alert("You have denied notification permissions. Please enable them in your browser settings to receive notifications.");
      return null;
    }

    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      console.log("Notification permission:", permission);

      if (permission !== "granted") return null;
    }

    const FCMtoken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    console.log("FCM Token:", FCMtoken);
    return FCMtoken;
  } catch (error) {
    console.error("FCM Error:", error);
    return null;
  }
};