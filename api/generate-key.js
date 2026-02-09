import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageURL, password } = req.body;

  if (!imageURL || !password) {
    return res.status(400).json({ error: "Missing imageURL or password" });
  }

  // Fetch image bytes from URL
  const response = await fetch(imageURL);
  const arrayBuffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);

  // Hashes
  const imageHash = crypto.createHash("sha256").update(imageBuffer).digest("hex");
  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  const finalKey = crypto.createHash("sha256").update(imageHash + passwordHash).digest("hex");

  res.status(200).json({ imageURL, imageHash, passwordHash, finalKey });
}
