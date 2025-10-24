const fs = require("fs");
const path = require("path");

const base64 = process.env.GOOGLE_SERVICES_JSON;

if (!base64) {
  throw new Error("❌ GOOGLE_SERVICES_JSON env variable is missing");
}

const filePath = path.resolve(__dirname, "../android/app/google-services.json");
fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
console.log("✅ google-services.json has been written");
