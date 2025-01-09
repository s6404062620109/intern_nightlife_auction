const express = require('express');
const Auction = require('../schemas/auctionSchema');
const Table = require('../schemas/tableSchema');
require('dotenv').config();

const router = express.Router();

router.post('/post', async (req, res) => {
    const { tableId, startTime, endTime, startCoins, bidRateCoins } = req.body;
  
    if (!req.body) {
        return res.status(400).json({ message: 'Body can not empty.' });
    }

    if(!tableId || !startTime || !endTime || !startCoins || !bidRateCoins){
        return res.status(400).json({ message: 'TableId, startTime, endTime, startCoins and bidRateCoins are required.' });
    }

    if (typeof tableId !== 'string') {
        return res.status(400).json({ message: 'TableId must be a string.' });
    }

    if (typeof startCoins !== 'number') {
        return res.status(400).json({ message: 'StartCoins must be a number.' });
    }
    
    if (typeof bidRateCoins !== 'number') {
        return res.status(400).json({ message: 'BidRateCoins must be a number.' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime())) {
        return res.status(400).json({ message: 'Invalid startTime format. Must be a valid date-time string.' });
    }
    if (isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Invalid endTime format. Must be a valid date-time string.' });
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
            checkpoint: {
                start: startTime,
                end: endTime
            },
            rules: {
                startCoins: startCoins,
                bidRateCoins: bidRateCoins
            }
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
        else{
            res.status(200).json({ data: auctionGetAll });
        }
        
    } 
    catch (error) {
      res.status(500).json({ message: 'Error get auction:', error });
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

router.put('/update', async (req, res) => {
    const { id, tableId, startTime, endTime, startCoins, bidRateCoins } = req.body;

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
    if (startCoins) {
        if (typeof startCoins !== 'number') {
            return res.status(400).json({ message: 'StartCoins must be a number.' });
        }
        updateFields['rules.startCoins'] = startCoins;
    }
    if (bidRateCoins) {
        if (typeof bidRateCoins !== 'number') {
            return res.status(400).json({ message: 'BidRateCoins must be a number.' });
        }
        updateFields['rules.bidRateCoins'] = bidRateCoins;
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