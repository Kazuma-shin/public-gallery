const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// SIMPLE ADMIN CREDENTIALS
const ADMIN_NAME = "shin";
const ADMIN_PASS = "shouya";

// Multer setup (multiple files)
const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

let media = [];

// Public gallery
app.get("/api/gallery", (req, res) => {
  res.json(media);
});

// Admin upload (name + password)
app.post("/api/upload", upload.array("files"), (req, res) => {
  const { name, password } = req.body;

  if (name !== ADMIN_NAME || password !== ADMIN_PASS) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  req.files.forEach(file => {
    const type = file.mimetype.startsWith("video") ? "video" : "image";
    media.push({
      // IMPORTANT: use request host, not localhost
      url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
      type
    });
  });

  res.json({ message: "Files uploaded successfully" });
});

// ✅ RENDER-COMPATIBLE PORT
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
