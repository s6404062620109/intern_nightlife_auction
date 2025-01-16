const express = require('express');
const BidHistory = require('../schemas/bidhistorySchema');
const User = require('../schemas/userSchema');
const Auction = require('../schemas/auctionSchema');
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
            return res.status(401).json({ message: `Please bid more than minimum ${findauction.startCoins}` })
        }

        if (maxBid !== 0) {
            if (offerBid <= maxBid || offerBid < maxBid + findauction.startCoins) {
                return res.status(401).json({ message: `Please bid more than current + minimum bid value ${maxBid + findauction.startCoins}` });
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

module.exports = router;