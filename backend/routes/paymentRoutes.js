const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const Payment = require('../schemas/paymentSchema');
const User = require('../schemas/userSchema');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/uploadReceipt', upload.single('receipt'), async (req, res) => {
    try {
        const { userId, auctionId } = req.body;

        if (!userId || !auctionId) {
            return res.status(400).json({ message: "User ID and Auction ID are required" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const payment = await Payment.findOne({ "payment_for.auctionId": auctionId });

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        const currentTime = new Date();
        if (currentTime > payment.timeout) {
            await Payment.deleteOne({ _id: payment._id });
            return res.status(400).json({ message: "Payment timeout exceeded, payment record deleted." });
        }

        const uploadPath = path.join(__dirname, `../usersImg/${userId}`);
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        const fileName = `receipt_${Date.now()}${path.extname(req.file.originalname)}`;
        const filePath = path.join(uploadPath, fileName);

        fs.writeFileSync(filePath, req.file.buffer);

        payment.user_refer.proof = filePath;
        payment.user_refer.time = new Date();
        await payment.save();

        res.status(200).json({ message: "Receipt uploaded successfully", filePath });
    } catch (error) {
        console.error("Upload Error:", error);
        return res.status(500).json({ message: "Server error during upload" });
    }
});

router.post('/post', async (req, res) => {
    const { price, userId, payment_method, payment_for  } = req.body;

    if(!price || !userId || !payment_for){
        return res.status(400).json({ message: "Price, userId and payment_for are required." });
    }

    if(typeof userId !== 'string'){
        return res.status(400).json({ message: "UserId must be string." });
    }
    if(typeof payment_for.auction !== 'boolean'){
        return res.status(400).json({ message: "Payment for auction must be boolean." });
    }
    if(payment_for.auction === true){
        if(!payment_for.auctionId || typeof payment_for.auctionId !== 'string'){
            return res.status(400).json({ message: "Payment for auction must have auctionId or payment auctionId must be string." });
        }
    }
    if(payment_method){
        if(typeof payment_method.name !== 'string' || typeof payment_method.code !== 'string'){
            return res.status(400).json({ message: "Payment method name or code must be string." });
        }
    }

    try{
        const userFind = await User.findById(userId);

        if(!userFind){
            return res.status(400).json({ message: "Not found user." });
        }

        const qrCodeData = `BANK_PAY://pay?amount=${price}&user=${userId}`;
        const qrCodeImage = await QRCode.toDataURL(qrCodeData);
        const timeout = new Date();
        timeout.setHours(timeout.getHours() + 1);

        const newPaymentData = {
            price,
            userId,
            payment_for,
            qrCode: qrCodeImage,
            timeout,
        };

        if (payment_method) {
            newPaymentData.payment_method = payment_method;
        }

        const newPayment = new Payment(newPaymentData);
        await newPayment.save();
        res.status(201).json({ message: "Payment created successfully", data: newPayment });

    } catch(error){
        console.error(error);
        res.status(500).json({ error: `Server error: ${error}` });
    }
});

router.get('/readPaymentByAuctionId/:auctionId', async (req, res) => {
    const { auctionId } = req.params;

    if(!auctionId){
        return res.status(400).json({ message: "AuctionId is required." });
    }
    if(typeof auctionId !== 'string'){
        return res.status(400).json({ message: "AuctionId must be string." });
    }

    try{
        const paymentFind = await Payment.findOne({ "payment_for.auctionId": auctionId });

        if(!paymentFind){
            return res.status(400).json({ message: "Payment not found." });
        }

        return res.status(200).json({ paymentFind });

    } catch(error){
        console.error(error);
        res.status(500).json({ error: `Server error: ${error}` });
    }
});

module.exports = router;