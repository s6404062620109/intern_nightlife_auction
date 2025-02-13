const express = require("express");
const path = require("path");
const router = express.Router();

router.use("/venueimg", express.static(path.join(__dirname, "../Venues")));
router.use("/userimg", express.static(path.join(__dirname, "../usersImg")));

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

module.exports = router;