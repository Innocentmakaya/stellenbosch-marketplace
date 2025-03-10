import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import supabase from "./supabaseClient";

// 🔹 Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAULuUloN3uVJ_Mg65t0ENWmREQGySEuuk",
  authDomain: "stellenbosch-marketplace.firebaseapp.com",
  projectId: "stellenbosch-marketplace",
  storageBucket: "stellenbosch-marketplace.appspot.com",
  messagingSenderId: "1010418002773",
  appId: "1:1010418002773:web:7c295f564810e695515ddc",
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 🔹 Request Notification Permission & Save Token in Supabase
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, { vapidKey: "BGcvhTIpcreP_KxlwC2UY28FDuV-N_jkFWJdhQHXVdze7indEs-_k6QIs2tLONq_cw8H9eA_VKjclVUyCvmvn_0" });
      
      console.log("FCM Token:", token);

      // Store token in Supabase if user is logged in
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (user?.user) {
        const { error: tokenError } = await supabase
          .from("users")
          .update({ fcm_token: token })
          .eq("id", user.user.id);

        if (tokenError) {
          console.error("Error storing FCM token:", tokenError);
        } else {
          console.log("FCM token saved to Supabase.");
        }
      }

      return token;
    } else {
      console.warn("Notification permission denied");
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
};

// 🔹 Handle Incoming Push Notifications
onMessage(messaging, (payload) => {
  console.log("Foreground Notification received:", payload);
  const { title, body } = payload.notification;
  new Notification(title, { body });
});

// 🔹 Function to Send Push Notifications
export const sendPushNotification = async (tokens, title, body) => {
  const firebaseServerKey = "1010418002773"; // 🔴 Replace with your Firebase Cloud Messaging server key
  
  const payload = {
    registration_ids: tokens,
    notification: {
      title,
      body,
      click_action: "https://stellenbosch-marketplace.vercel.app",
    },
  };

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${firebaseServerKey}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("Push notification response:", result);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};

export { messaging, getToken, onMessage };
