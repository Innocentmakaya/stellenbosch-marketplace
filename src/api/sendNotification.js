const admin = require("firebase-admin");

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { title, price, tokens } = req.body;

  if (!tokens || tokens.length === 0) {
    return res.status(400).json({ error: "No FCM tokens provided" });
  }

  const message = {
    notification: {
      title: "New Item Listed!",
      body: `${title} is now available for R${price}.`,
    },
    tokens, // Send to multiple devices
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("FCM Error:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
};
