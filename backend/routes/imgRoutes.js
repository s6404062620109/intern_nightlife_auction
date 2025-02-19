const express = require("express");
const multer = require("multer");
const path = require("path");
const User = require("../schemas/userSchema");
const router = express.Router();

router.use("/venueimg", express.static(path.join(__dirname, "../Venues")));
router.use("/userimg", express.static(path.join(__dirname, "../usersImg")));

const userStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "usersImg/");
    },
    filename: (req, file, cb) => {
      cb(null, `${req.params.userId}_${Date.now()}${path.extname(file.originalname)}`);
    },
});

const uploadProfile = multer({ userStorage });

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

      // Delete the old profile image if it exists
      if (user.profileImg) {
          const oldImagePath = path.join(__dirname, 'usersImg', user.profileImg);
          fs.unlink(oldImagePath, (err) => {
              if (err) console.error("Failed to delete old image:", err);
          });
      }

      // Update the profileImg attribute
      user.profileImg = req.file.filename;
      await user.save();

      res.status(200).json({ url: `/img/userimg/${req.file.filename}` });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;