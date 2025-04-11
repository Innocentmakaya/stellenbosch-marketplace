export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { from, to, date } = req.body;

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID || "0e5bc7cf-a989-495a-96d8-178e2508d076", // Use the one from App.jsx as fallback
        headings: { en: "New Ride Available!" },
        contents: { en: `New ride from ${from} to ${to} on ${date}! Check it out now.` },
        included_segments: ["All"],
      }),
    });

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error sending ride notification:", error);
    res.status(500).json({ error: "Failed to send ride notification" });
  }
} 