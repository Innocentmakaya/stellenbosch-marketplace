export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { from, to, date, time, rideId } = req.body;

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID || "0e5bc7cf-a989-495a-96d8-178e2508d076",
        headings: { en: "Ride Shared With You!" },
        contents: { en: `Someone shared a ride from ${from} to ${to} on ${date} at ${time}. Check it out!` },
        included_segments: ["All"],
        web_url: `${req.headers.origin}/ride/${rideId}`, // Direct link to the specific ride
        url: `${req.headers.origin}/ride/${rideId}`, // For mobile apps
      }),
    });

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error sharing ride:", error);
    res.status(500).json({ error: "Failed to share ride" });
  }
} 