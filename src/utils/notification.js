export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notifications.");
      return;
    }
  
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };
  
  export const sendNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else {
      console.log("Notifications are blocked. Please allow them in your browser settings.");
    }
  };
  