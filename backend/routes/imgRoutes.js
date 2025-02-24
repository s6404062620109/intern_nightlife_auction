const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../schemas/userSchema");
const router = express.Router();

router.use("/venueimg", express.static(path.join(__dirname, "../Venues")));
router.use("/userimg", express.static(path.join(__dirname, "../usersImg")));

const userStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userFolder = path.join(__dirname, `../usersImg/${req.params.userId}`);

        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
        }

        cb(null, userFolder);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
});

const uploadProfile = multer({ storage: userStorage });

router.get("/getImg/:imgId", (req, res) => {
    const { imgId } = req.params;
    const imageUrl = `${req.protocol}://${req.get("host")}/img/venueimg/${imgId}`;
    res.status(200).json({ url: imageUrl });
});

router.get("/getUserProfile/:userId/:imgId", (req, res) => {
    const { userId, imgId } = req.params;
    const imageUrl = `${req.protocol}://${req.get("host")}/img/userimg/${userId}/${imgId}`;
    res.status(200).json({ url: imageUrl });
});

router.post("/upload/userProfile/:userId", uploadProfile.single("profileImg"), async (req, res) => {
  const { userId } = req.params;

  try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
      }

      const userFolder = path.join(__dirname, `../usersImg/${userId}`);

      if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
      }

      const newFilename = req.file.filename;

      fs.readdir(userFolder, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
        } else {
            files.forEach((file) => {
                const filePath = path.join(userFolder, file);
                if (file !== newFilename) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Error deleting file:", err);
                    });
                }
            });
        }
        });

      user.profileImg = req.file.filename;
      await user.save();

      res.status(200).json({ url: `/img/userimg/${userId}/${req.file.filename}` });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;