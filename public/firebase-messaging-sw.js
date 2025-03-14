// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyAqMHe8MB8xwe77nJmJ5sCBBIWNEjxMgmk",
    authDomain: "stelliesmarketnotifications.firebaseapp.com",
    projectId: "stelliesmarketnotifications",
    storageBucket: "stelliesmarketnotifications.firebasestorage.app",
    messagingSenderId: "787238005907",
    appId: "1:787238005907:web:28cff7a131584cc12b7166",
    measurementId: "G-3J5JW1NFZB"
  };

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
