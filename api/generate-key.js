import crypto from "crypto";
import sharp from "sharp";

async function normalizeImage(base64) {
  const buffer = Buffer.from(base64, "base64");
  const normalized = await sharp(buffer).png({ compressionLevel: 9 }).toBuffer();
  return normalized;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageBase64, password } = req.body;

  if (!imageBase64 || !password) {
    return res.status(400).json({ error: "Missing image or password" });
  }

  // Normalize image
  const normalizedImage = await normalizeImage(imageBase64);

  // Hashes
  const imageHash = crypto.createHash("sha256").update(normalizedImage).digest("hex");
  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  const finalKey = crypto.createHash("sha256").update(imageHash + passwordHash).digest("hex");

  res.status(200).json({ imageHash, passwordHash, finalKey });
}
