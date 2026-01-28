// build.js
const fs = require("fs");
const path = require("path");

console.log("🔨 Starting custom build...");

const distDir = path.join(__dirname, "dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
  console.log("📁 Created dist/ folder");
}

// Copy index.html if it exists
const indexHtml = path.join(__dirname, "index.html");
if (fs.existsSync(indexHtml)) {
  fs.copyFileSync(indexHtml, path.join(distDir, "index.html"));
  console.log("✅ Copied index.html to dist/");
}

// Copy public folder if exists
const publicDir = path.join(__dirname, "public");
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, path.join(distDir, "public"), { recursive: true });
  console.log("✅ Copied public/ to dist/");
}

console.log("🎉 Build finished successfully!");
