
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
  destination: "uploads/",
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
      url: `http://localhost:4000/uploads/${file.filename}`,
      type
    });
  });

  res.json({ message: "Files uploaded successfully" });
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));
