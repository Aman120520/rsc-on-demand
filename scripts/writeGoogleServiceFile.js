const fs = require("fs");
const path = require("path");

const base64 = process.env.GOOGLE_SERVICE_INFO;
if (!base64) {
  throw new Error("❌ GOOGLE_SERVICE_INFO env variable is missing");
}

const filePath = path.resolve(__dirname, "../GoogleService-Info.plist");
fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
console.log("✅ GoogleService-Info.plist has been written");
