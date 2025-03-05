const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
const multer = require('multer');    
const path = require('path');
const nodemailer = require('nodemailer');
const axios = require('axios');
const Payment = require('../schemas/paymentSchema');
const Auction = require('../schemas/auctionSchema');
const BidHistory = require('../schemas/bidhistorySchema');
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

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS
            }
        });

        const currentTime = new Date();
        if (currentTime > payment.timeout) {

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Notify previous winner about timeout
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "Payment Timeout Notice",
                text: `Dear ${user.name},\n\nYour payment for Auction ID ${auctionId} has exceeded the allowed time and has been canceled.\n\nIf you have any questions, please contact support.\n\nBest regards,\nAuction Platform Team`
            };
            await transporter.sendMail(mailOptions);

            // Remove payment and bid record
            await Payment.deleteOne({ _id: payment._id });
            await BidHistory.deleteOne({ offerId: userId, auctionId });

            const findAuction = await Auction.findById(auctionId);
            if (!findAuction) {
                return res.status(404).json({ message: "Auction not found" });
            }

            // Get the second-highest bidder
            const bidHistory = await BidHistory.find({ auctionId }).sort({ offerBid: -1 }).limit(1);
            if (bidHistory.length === 0) {
                return res.status(400).json({ message: "No second-highest bidder available." });
            }

            const newWinnerBid = bidHistory[0];
            const newWinner = await User.findById(newWinnerBid.offerId);
            if (!newWinner) {
                return res.status(404).json({ message: "New winner not found." });
            }

            // Update auction winner details
            await findAuction.updateOne({
                $set: {
                    "checkpoint.end": new Date(),
                    "winner.name": newWinner.name,
                    "winner.bidValue": newWinnerBid.offerBid,
                    "winner.time": new Date()
                }
            });

            // Send email to the new winner
            const newWinnerMailOptions = {
                from: process.env.EMAIL_USER,
                to: newWinner.email,
                subject: "🎉 Congratulations! You Are Now the Auction Winner 🎉",
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #2a9d8f;">🎉 Congratulations, ${newWinner.name}! 🎉</h2>
                        <p>The previous winner failed to complete the payment. You are now the highest bidder for Auction ID <strong>${auctionId}</strong>.</p>
                        <p>Your winning bid is: <strong>$${newWinnerBid.offerBid}</strong>.</p>
                        <p>Please proceed with the payment to confirm your win.</p>
                        <p style="margin: 20px 0;">
                            <a 
                                href="${process.env.FRONTEND_URL}/auction/${auctionId}/payment/" 
                                style="
                                    display: inline-block; 
                                    padding: 10px 20px; 
                                    background-color: #2a9d8f; 
                                    color: #ffffff; 
                                    text-decoration: none; 
                                    border-radius: 5px; 
                                    font-weight: bold;
                                "
                            >
                                Proceed to Payment
                            </a>
                        </p>
                        <p>If you have any questions, please contact support.</p>
                    </div>
                `,
            };
            await transporter.sendMail(newWinnerMailOptions);

            // Create a new payment for the new winner
            try {
                const paymentResponse = await axios.post(`${process.env.CLIENT_URL}/payment/post`, {
                    price: newWinnerBid.offerBid,
                    userId: newWinner._id.toString(),
                    payment_for: {
                        auction: true,
                        auctionId: auctionId
                    }
                });
            
                return res.status(200).json({
                    message: "Previous winner removed, new winner assigned",
                    newWinner: {
                        name: newWinner.name,
                        bid: newWinnerBid.offerBid
                    },
                    emailStatus: "Winner email sent successfully",
                    paymentStatus: paymentResponse.data
                });
            
            } catch (paymentError) {
                console.error("Payment API Error:", paymentError);
                return res.status(500).json({ message: "Payment process failed", error: paymentError.response?.data || paymentError.message });
            }
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