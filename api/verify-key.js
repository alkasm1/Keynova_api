import crypto from "crypto";
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    let { imageURL, password, finalKey } = req.body;

    if (!imageURL || !password || !finalKey) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Clean finalKey
    finalKey = finalKey
      .trim()
      .replace(/\r/g, "")
      .replace(/\n/g, "")
      .replace(/\s+/g, "")
      .replace(/[^a-fA-F0-9]/g, "");

    // Normalize password
    const normalizedPassword = password.normalize("NFC");

    // Fix image URL (convert relative → absolute)
    if (imageURL.startsWith("/")) {
      imageURL = `https://${req.headers.host}${imageURL}`;
    }

    // Fetch image bytes
    const response = await fetch(imageURL);
    if (!response.ok) {
      return res.status(400).json({ error: "Failed to fetch image", url: imageURL });
    }

    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Hashes
    const imageHash = crypto.createHash("sha256").update(imageBuffer).digest("hex");
    const passwordHash = crypto.createHash("sha256").update(normalizedPassword).digest("hex");
    const generatedKey = crypto.createHash("sha256").update(imageHash + passwordHash).digest("hex");

    const match = generatedKey === finalKey;

    return res.status(200).json({
      match,
      generatedKey
    });

  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
