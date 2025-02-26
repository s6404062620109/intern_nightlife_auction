const express = require('express');
const QRCode = require('qrcode');
const Payment = require('../schemas/paymentSchema');
const User = require('../schemas/userSchema');

const router = express.Router();

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