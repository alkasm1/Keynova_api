import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageURL, password, finalKey } = req.body;

  if (!imageURL || !password || !finalKey) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Fetch image bytes from URL
  const response = await fetch(imageURL);
  const arrayBuffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);

  const imageHash = crypto.createHash("sha256").update(imageBuffer).digest("hex");
  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  const generatedKey = crypto.createHash("sha256").update(imageHash + passwordHash).digest("hex");

  const match = generatedKey === finalKey;

  res.status(200).json({ match, generatedKey });
}
