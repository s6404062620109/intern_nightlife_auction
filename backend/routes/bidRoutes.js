const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const BidHistory = require('../schemas/bidhistorySchema');
const User = require('../schemas/userSchema');
const Auction = require('../schemas/auctionSchema');
const Table = require('../schemas/tableSchema');
const Venue = require('../schemas/venueSchema');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

router.post('/post', async (req, res) => {
    const { offerBid, offerId, auctionId } = req.body;
  
    if (!req.body) {
        return res.status(400).json({ message: 'Body can not empty.' });
    }

    if(!offerBid || !offerId || !auctionId ){
        return res.status(400).json({ message: 'OfferBid, offerId and auctionId are required.' });
    }

    if (typeof offerBid !== 'number') {
        return res.status(400).json({ message: 'OfferBid must be a number.' });
    }

    if (typeof offerId !== 'string') {
        return res.status(400).json({ message: 'OfferId must be a string.' });
    }
    
    if (typeof auctionId !== 'string') {
        return res.status(400).json({ message: 'auctionId must be a string.' });
    }

    const datetime = new Date();

    if (isNaN(datetime.getTime())) {
        return res.status(400).json({ message: 'Invalid time format. Must be a valid date-time string.' });
    }
  
    try {

        const finduser = await User.findById(offerId);
        const findauction = await Auction.findById(auctionId);

        if(!finduser){
            return res.status(404).json({ message: 'Not found User.' });
        }
        if(!findauction){
            return res.status(404).json({ message: 'Not found Auction.' });
        }
 
        const auctionStart = new Date(findauction.checkpoint.start).getTime();
        const auctionEnd = new Date(findauction.checkpoint.end).getTime();
        const comparetime  = datetime.getTime();

        if (isNaN(auctionStart) || isNaN(auctionEnd)) {
            return res.status(500).json({ message: 'Invalid auction checkpoint dates.' });
        }
        
        if (comparetime < auctionStart) {
            return res.status(400).json({ message: 'Auction has not started yet.' });
        }
        
        if (comparetime > auctionEnd) {
            return res.status(400).json({ message: 'Auction has already ended.' });
        }

        const maxBidRecord = await BidHistory.findOne({ auctionId }).sort({ offerBid: -1 }).select('offerBid');
        const maxBid = maxBidRecord ? maxBidRecord.offerBid : 0;
        
        if(offerBid < findauction.startCoins){
            return res.status(401).json({ message: `Please bid more than minimum ${findauction.startCoins} Coins.` })
        }

        if (maxBid !== 0) {
            if (offerBid <= maxBid) {
                return res.status(401).json({ message: `Please bid more than current bid value ${maxBid} Coins.` });
            }
        }

        const oneMinuteAgo = new Date(datetime.getTime() - 60 * 1000);
        const recentBid = await BidHistory.findOne({
            auctionId,
            offerId,
            time: { $gte: oneMinuteAgo }
        });

        if (recentBid) {
            return res.status(400).json({ message: 'You cannot place another bid within 1 minute.' });
        }

        const existingBid = await BidHistory.findOne({ auctionId, offerBid });
        if (existingBid) {
            const existingTime = new Date(existingBid.time).getTime();
            if (comparetime === existingTime) {
                return res.status(400).json({ message: 'A bid with the same offerBid and time already exists.' });
            }
        }
        
        const newBidHistory = new BidHistory({
            offerBid,
            time: datetime,
            offerId,
            auctionId
        });
        await newBidHistory.save();
      
        res.status(200).json({ newBidHistory });
        
    } 
    catch (error) {
      res.status(500).json({ message: 'Error post bid history:', error });
    }
});

router.get('/readAll', async (req, res) => {
    try {
        const bidGetAll = await BidHistory.find();

        if(!bidGetAll){
            res.status(409).json({ message: "BidHoistory not found." });
        }
        else{
            res.status(200).json({ data: bidGetAll });
        }
        
    } 
    catch (error) {
      res.status(500).json({ message: 'Error get bid history    :', error });
    }
});

router.get('/readById/:id', async (req, res) => {
    const { id } = req.params;

    if(!id){
        return res.status(400).json({ message: 'Id are required.' });
    }

    if(typeof id  !== 'string'){
        return res.status(400).json({ message: 'Id must be a string.' });
    }
    
    try {
        const BidHistoryGet = await BidHistory.findById(id);

        if(!BidHistoryGet){
            res.status(409).json({ message: "Bid history not found." });
        }
        else{
            res.status(200).json({ data: BidHistoryGet });
        }
        
    } 
    catch (error) {
      res.status(500).json({ message: 'Error get bid history:', error });
    }
});

router.get('/readByAuction/:auctionId', async (req, res) => {
    const { auctionId } = req.params;

    if(!auctionId){
        return res.status(400).json({ message: 'AuctionId are required.' });
    }

    if(typeof auctionId  !== 'string'){
        return res.status(400).json({ message: 'AuctionId must be a string.' });
    }
    
    try {
        const BidHistoryGet = await BidHistory.find({ auctionId });
        const bidHistoryWithUserInfo = await Promise.all(
            BidHistoryGet.map(async (bid) => {
                const user = await User.findById(bid.offerId);
                return { ...bid._doc, userInfo: user };
            })
        );

        if(!bidHistoryWithUserInfo){
            res.status(409).json({ message: "Bid history not found." });
        }

        else{
            res.status(200).json({ data: bidHistoryWithUserInfo });
        }
    } 
    catch (error) {
      res.status(500).json({ message: 'Error get bid history:', error });
    }
});

router.get('/readByEmail/:email', async (req, res) => {
    const { email } = req.params;

    if(!email){
        return res.status(400).json({ message: 'Email are required.' });
    }

    if(typeof email  !== 'string'){
        return res.status(400).json({ message: 'Email must be a string.' });
    }
    
    try {
        const finduser = await User.findOne({ email: email });

        if(!finduser){
            return res.status(404).json({ message: 'Not found User.' });
        }

        const BidHistoryGet = await BidHistory.find({ offerId: finduser._id });

        if(!BidHistoryGet){
            res.status(409).json({ message: "Bid history not found." });
        }
        else{
            res.status(200).json({ data: BidHistoryGet });
        }
        
    } 
    catch (error) {
      res.status(500).json({ message: 'Error get bid history:', error });
    }
});

router.get('/readJoinAuctions/:userId', async (req, res) => {
    const { userId } = req.params;

    if(!userId){
        return res.status(401).json({ message: "UserId are required." });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid userId format." });
    }

    try{
        const myBidAuctions = await BidHistory.find({ offerId: userId }).sort({ time: -1 });

        const latestBids = Object.values(
            myBidAuctions.reduce((acc, bid) => {
                if (!acc[bid.auctionId]) acc[bid.auctionId] = bid; 
                return acc;
            }, {})
        );

        if (!latestBids.length) {
            return res.status(404).json({ message: "No auctions found for this user." });
        }
        
        const result = [];
        for (const bid of Object.values(latestBids)) {
            const auction = await Auction.findById(bid.auctionId);
            if (!auction) continue;

            const table = await Table.findById(auction.tableId);
            if (!table) continue;

            const venue = await Venue.findById(table.venueId);
            if (!venue) continue;

            result.push({
                auctionId: bid.auctionId,
                bidValue: bid.offerBid,
                bidTime: bid.time,
                auctionDetails: {
                    startCoins: auction.startCoins,
                    checkpoint: auction.checkpoint,
                    accesstime: auction.accesstime,
                    winner: auction.winner
                },
                table: {
                    id: auction.tableId,
                    name: table.name,
                    seats: table.seats
                },
                venue: {
                    name: venue.name,
                    address: venue.address,
                    banner: venue.banner,
                    contact: venue.contact
                }
            });
        }

        if (!result.length) {
            return res.status(404).json({ message: "No valid auctions found." });
        }

        res.status(200).json({ auctions: result });

    } catch(error) {
        console.log('Error get auction:', error);
    }
});

router.put('/update', async (req, res) => {
    const { id, offerBid, time, offerId, auctionId } = req.body;

    if (!req.body) {
        return res.status(400).json({ message: 'Body can not empty.' });
    }

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Id is required and must be a string.' });
    }

    const updateFields = {};
    if(offerBid){
        if (typeof offerBid !== 'number') {
            return res.status(400).json({ message: 'OfferBid must be a number.' });
        }
        updateFields.offerBid = offerBid;
    }
    
    if(offerId){
        if (typeof offerId !== 'string') {
            return res.status(400).json({ message: 'OfferId must be a string.' });
        }
        updateFields.offerId = offerId;
    }
    
    if(auctionId){
        if (typeof auctionId !== 'string') {
            return res.status(400).json({ message: 'auctionId must be a string.' });
        }
        updateFields.auctionId = auctionId;
    }
    
    if(time){
        const datetime = new Date(time);

        if (isNaN(datetime.getTime())) {
            return res.status(400).json({ message: 'Invalid time format. Must be a valid date-time string.' });
        }
        updateFields.time = datetime;
    }
    

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
    }
    
    try {
        const historyUpdate = await BidHistory.updateOne(
            { _id: id },
            { $set: updateFields }
        );

        if (historyUpdate.matchedCount === 0) {
            return res.status(404).json({ message: 'BidHistory not found update.' });
        }

        res.status(200).json({ message: 'BidHistory updated successfully.', data: updateFields });
    } 
    catch (error) {
      res.status(500).json({ message: 'Error get bid history:', error });
    }
});

router.delete('/delete', async (req, res) => {
    const { id } = req.body;
  
    if (!req.body) {
        return res.status(400).json({ message: 'Body can not empty.' });
    }

    if(!id){
        return res.status(400).json({ message: 'Id are required.' });
    }

    if(typeof id  !== 'string'){
        return res.status(400).json({ message: 'Id must be a string.' });
    }
  
    try {
        const bidfind = BidHistory.find({ "_id": id});
        if(!bidfind){
            return res.status(404).json({ message: 'Bid history Not found.' });
        }
        await bidfind.deleteOne();
  
        res.status(200).json({ message: 'BidHistory delete successfully' });
    } 
    catch (error) {
      res.status(500).json({ message: 'Error delete bid history:', error });
    }
});

router.get('/summarywin/:auctionId', async (req, res) => {
    const { auctionId } = req.params;

    if (!auctionId) {
        return res.status(400).json({ message: 'AuctionId is required.' });
    }

    if (typeof auctionId !== 'string') {
        return res.status(400).json({ message: 'AuctionId must be a string.' });
    }

    try {
        const getAuction = await Auction.findById(auctionId);
        if (!getAuction) {
            return res.status(404).json({ message: "Auction not found." });
        }

        const getTable = await Table.findById(getAuction.tableId);
        if (!getTable) {
            return res.status(404).json({ message: "Table not found." });
        }

        const highestBid = await BidHistory.find({ auctionId })
            .sort({ offerBid: -1 })
            .limit(1);

        if (!highestBid.length) {
            return res.status(404).json({ message: "No bid records for this auction." });
        }

        const user = await User.findById(highestBid[0].offerId);
        if (!user) {
            return res.status(404).json({ message: "Winner not found." });
        }

        const datenow = new Date();

        if (getAuction.winner.name || getAuction.winner.bidValue || getAuction.winner.time) {
            return res.status(401).json({ message: "Auction already has a winner." });
        }

        await getAuction.updateOne({
            $set: {
                "checkpoint.end": datenow,
                "winner.name": user.name,
                "winner.bidValue": highestBid[0].offerBid,
                "winner.time": datenow
            }
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: '🎉 Congratulations! You Won the Auction 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #2a9d8f;">🎉 Congratulations, ${user.name}! 🎉</h2>
                    <p>You have won the auction for table <strong>${getTable.name}</strong> with a bid of <strong>$${highestBid[0].offerBid}</strong>.</p>
                    <p>Please proceed with the payment.</p>
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
                </div>
            `,
        };

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return res.status(500).json({ message: "Error sending email", error });
            }

            console.log("Email sent:", info.response);

            try {
                const paymentResponse = await axios.post(`${process.env.CLIENT_URL}/payment/post`, {
                    price: highestBid[0].offerBid,
                    userId: user._id.toString(),
                    payment_for: {
                        auction: true,
                        auctionId: auctionId
                    }
                });

                return res.status(200).json({
                    highestBid: highestBid[0],
                    winner: {
                        name: user.name,
                        email: user.email
                    },
                    emailStatus: "Winner email sent successfully",
                    paymentStatus: paymentResponse.data
                });

            } catch (paymentError) {
                console.error("Payment API Error:", paymentError);
                return res.status(500).json({ message: "Payment process failed", error: paymentError.response?.data || paymentError.message });
            }
        });

    } catch (error) {
        console.error("Error in summarywin:", error);
        res.status(500).json({ message: 'Error processing auction summary', error });
    }
});

module.exports = router;