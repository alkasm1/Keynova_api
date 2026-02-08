import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageBase64, password } = req.body;

  if (!imageBase64 || !password) {
    return res.status(400).json({ error: "Missing image or password" });
  }

  const imageBuffer = Buffer.from(imageBase64, "base64");

  const imageHash = crypto.createHash("sha256").update(imageBuffer).digest("hex");
  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  const finalKey = crypto.createHash("sha256").update(imageHash + passwordHash).digest("hex");

  res.status(200).json({ imageHash, passwordHash, finalKey });
}
