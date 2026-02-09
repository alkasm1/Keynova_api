import crypto from "crypto";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageID, password, finalKey } = req.body;

  if (!imageID || !password || !finalKey) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const imagePath = path.join(process.cwd(), "images", `${imageID}.png`);

  if (!fs.existsSync(imagePath)) {
    return res.status(400).json({ error: "Image not found" });
  }

  const imageBuffer = fs.readFileSync(imagePath);

  const imageHash = crypto.createHash("sha256").update(imageBuffer).digest("hex");
  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  const generatedKey = crypto.createHash("sha256").update(imageHash + passwordHash).digest("hex");

  const match = generatedKey === finalKey;

  res.status(200).json({ match, generatedKey });
}
