const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ====================
// ADMIN CREDENTIALS
// ====================
const ADMIN_NAME = "shin";
const ADMIN_PASS = "shouya";

// ====================
// MULTER SETUP
// ====================
const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// ====================
// IN-MEMORY GALLERY
// ====================
let media = [];

// ====================
// ROUTES
// ====================

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Gallery backend is running");
});

// ✅ Public gallery
app.get("/api/gallery", (req, res) => {
  res.json(media);
});

// ✅ Admin upload (name + password REQUIRED)
app.post("/api/upload", upload.array("files"), (req, res) => {
  const { name, password } = req.body;

  if (name !== ADMIN_NAME || password !== ADMIN_PASS) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  req.files.forEach(file => {
    const type = file.mimetype.startsWith("video") ? "video" : "image";

    media.push({
      url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
      type,
      filename: file.filename
    });
  });

  res.json({ message: "Files uploaded successfully" });
});

// ❌ Delete media (NO PASSWORD REQUIRED)
app.delete("/api/delete/:index", (req, res) => {
  const index = parseInt(req.params.index);

  if (isNaN(index) || index < 0 || index >= media.length) {
    return res.status(400).json({ message: "Invalid index" });
  }

  const item = media[index];

  // Remove file from disk
  const filePath = path.join(__dirname, "uploads", item.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  media.splice(index, 1);
  res.json({ message: "Deleted successfully" });
});

// ====================
// START SERVER (RENDER SAFE)
// ====================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
