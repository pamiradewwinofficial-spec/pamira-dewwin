const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// -------------------------
// Multer Storage for uploaded files
// -------------------------
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    // Save with timestamp + original extension
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// -------------------------
// Serve static files
// -------------------------
app.use(express.static("public")); // your website
app.use("/uploads", express.static("uploads")); // uploaded images

// -------------------------
// Upload endpoint (admin only)
// -------------------------
app.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");
  res.send("Photo uploaded successfully!");
});

// -------------------------
// Endpoint to get list of uploaded images
// -------------------------
app.get("/uploads", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) return res.status(500).json({ error: "Cannot list files" });
    // Only return image files
    const images = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
    res.json(images);
  });
});

// -------------------------
// Start the server
// -------------------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
