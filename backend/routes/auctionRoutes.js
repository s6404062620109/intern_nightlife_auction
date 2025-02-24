const express = require('express');
const Auction = require('../schemas/auctionSchema');
const Venue = require('../schemas/venueSchema');
const Table = require('../schemas/tableSchema');
const BidHistory = require('../schemas/bidhistorySchema');
require('dotenv').config();

const router = express.Router();

router.post('/post', async (req, res) => {
    const { tableId, accesstime, startTime, endTime, startCoins } = req.body;
  
    if (!req.body) {
        return res.status(400).json({ message: 'Body can not empty.' });
    }

    if (!tableId || !accesstime || !startTime || !endTime || !startCoins) {
        return res.status(400).json({ message: 'tableId, accesstime, startTime, endTime, and startCoins are required.' });
    }

    if (typeof tableId !== 'string' || typeof startCoins !== 'number') {
        return res.status(400).json({ message: 'Invalid data types.' });
    }

    const accessDate = new Date(accesstime);
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(accessDate.getTime()) || isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Invalid starttime, endtime and accesstime date format.' });
    }

    if (start >= end) {
        return res.status(400).json({ message: 'startTime must be before endTime.' });
    }
  
    try {

        const findtable = await Table.findById(tableId);
        
        if(!findtable){
            return res.status(404).json({ message: 'Not found Table.' });
        }

        const newAuction = new Auction({
            tableId,
            accesstime: accessDate,
            checkpoint: { start, end },
            startCoins,
        });
        await newAuction.save();
  
        res.status(200).json({ message: 'Auction post successfully' });
    } 
    catch (error) {
      res.status(500).json({ message: 'Error post auction:', error });
    }
});

router.get('/readAll', async (req, res) => {
    try {
        const auctionGetAll = await Auction.find();

        if(!auctionGetAll){
            res.status(409).json({ message: "Auction not found." });
        }
        
        res.status(200).json({ data: auctionGetAll });
        
    } 
    catch (error) {
      res.status(500).json({ message: 'Error get auction:', error });
    }
});

router.get('/readAuctionForBanner', async (req, res) => {
    try {
        const auctionGetAll = await Auction.find();

        if (!auctionGetAll || auctionGetAll.length === 0) {
            return res.status(404).json({ message: "Auction not found." });
        }

        const venueMap = new Map();

        for (const auction of auctionGetAll) {
            const table = await Table.findById(auction.tableId);
            if (!table) continue;

            const venue = await Venue.findById(table.venueId);
            if (!venue) continue;

            // Check if venue already exists in the map
            if (!venueMap.has(venue._id.toString())) {
                venueMap.set(venue._id.toString(), {
                    venue,
                    auctions: []
                });
            }

            // Push the auction into the venue's auction list
            venueMap.get(venue._id.toString()).auctions.push(auction);
        }

        res.status(200).json({ data: Array.from(venueMap.values()) });
    } 
    catch (error) {
        res.status(500).json({ message: 'Error getting auction', error });
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
        const auctionGet = await Auction.findById(id);

        if(!auctionGet){
            res.status(409).json({ message: "Auction not found." });
        }
        else{
            res.status(200).json({ data: auctionGet });
        }
        
    } 
    catch (error) {
      res.status(500).json({ message: 'Error get auction:', error });
    }
});

router.get('/readByTableId/:tableId', async (req, res) => {
    const { tableId } = req.params;

    if(!tableId){
        return res.status(400).json({ message: 'TableId are required.' });
    }

    if(typeof tableId  !== 'string'){
        return res.status(400).json({ message: 'TableId must be a string.' });
    }
    
    try {
        const auctionGet = await Auction.find({ "tableId": tableId });

        if(!auctionGet){
            res.status(409).json({ message: "Auction not found." });
        }
        else{
            res.status(200).json({ data: auctionGet });
        }
        
    } 
    catch (error) {
      res.status(500).json({ message: 'Error get table:', error });
    }
});

router.get('/readMyAuctions/:venueId', async (req, res) => {
    const { venueId } = req.params;

    if(!venueId){
        return res.status(400).json({ message: 'VenueId are required.' });
    }

    if(typeof venueId  !== 'string'){
        return res.status(400).json({ message: 'VenueId must be a string.' });
    }
    
    try {
        const tables = await Table.find({ venueId });

        if (!tables.length) {
            return res.status(404).json({ message: 'No tables found for this venue.' });
        }

        const tablesWithAuctions = [];
        for (const table of tables) {
            const auctions = await Auction.find({ tableId: table._id });

            const auctionsWithHighestBids = [];

            for (const auction of auctions) {
                const highestBid = await BidHistory.findOne({ auctionId: auction._id })
                    .sort({ offerBid: -1 })
                    .limit(1)
                    .lean();

                auctionsWithHighestBids.push({
                    ...auction._doc,
                    highestBid: highestBid ? highestBid.offerBid : null,
                });
            }

            tablesWithAuctions.push({
                ...table._doc,
                auctions: auctionsWithHighestBids,
            });
        }
        res.status(200).json({ data: tablesWithAuctions });
        
    } 
    catch (error) {
      res.status(500).json({ message: 'Error get table:', error });
    }
});

router.put('/update', async (req, res) => {
    const { id, tableId, accesstime, startTime, endTime, startCoins } = req.body;

    if (!req.body) {
        return res.status(400).json({ message: 'Body can not empty.' });
    }

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Id is required and must be a string.' });
    }

    const updateFields = {};
    if (tableId) {
        if (typeof tableId !== 'string') {
            return res.status(400).json({ message: 'TableId must be a string.' });
        }
        updateFields['tableId'] = tableId;
    }

    if (accesstime){
        const acctime = new Date(accesstime);
        if (isNaN(acctime.getTime())) {
            return res.status(400).json({ message: 'Invalid accesstime format. Must be a valid date-time string.' });
        }
        updateFields['accesstime'] = acctime;
    }

    if (startCoins) {
        if (typeof startCoins !== 'number') {
            return res.status(400).json({ message: 'StartCoins must be a number.' });
        }
        updateFields['startCoins'] = startCoins;
    }

    if (startTime){
        const start = new Date(startTime);
        if (isNaN(start.getTime())) {
            return res.status(400).json({ message: 'Invalid startTime format. Must be a valid date-time string.' });
        }
        updateFields['checkpoint.start'] = start;
    }
    
    if(endTime){    
        const end = new Date(endTime);
        if (startTime && updateFields.startTime >= updateFields.endTime) {
            return res.status(400).json({ message: 'startTime must be before endTime.' });
        }

        if (isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Invalid endTime format. Must be a valid date-time string.' });
        }
        updateFields['checkpoint.end'] = end;
    }

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
    }
    
    try {
        const auctionUpdate = await Auction.updateOne(
            { _id: id },
            { $set: updateFields }
        );

        if (auctionUpdate.matchedCount === 0) {
            return res.status(404).json({ message: 'Auction not found update.' });
        }

        res.status(200).json({ message: 'Auction updated successfully.', data: updateFields });
    } 
    catch (error) {
      res.status(500).json({ message: 'Error get auction:', error });
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
        const tablefind = Auction.find({ "_id": id});
        await tablefind.deleteOne();
  
        res.status(200).json({ message: 'Auction delete successfully' });
    } 
    catch (error) {
      res.status(500).json({ message: 'Error delete auction:', error });
    }
});

module.exports = router;