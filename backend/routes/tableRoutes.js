const express = require('express');
const Table = require('../schemas/tableSchema');
require('dotenv').config();

const router = express.Router();

router.post('/post', async (req, res) => {
    const { seats, name, venueId } = req.body;
  
    if (!req.body) {
        return res.status(400).json({ message: 'Body can not empty.' });
    }

    if(!seats || !name || !venueId ){
        return res.status(400).json({ message: 'Seats, name and venueId are required.' });
    }

    if(typeof seats !== 'number'){
        return res.status(400).json({ message: 'Seats must be a number.' });
    }

    if(typeof name !== 'string'){
        return res.status(400).json({ message: 'Name must be a string.' });
    }

    if(typeof venueId !== 'string'){
        return res.status(400).json({ message: 'VenueId must be a string.' });
    }
  
    try {
        const newTable = new Table({
            seats,
            name,
            venueId
        });
        await newTable.save();
  
        res.status(200).json({ message: 'Table post successfully' });
    } 
    catch (error) {
      res.status(500).json({ message: 'Error post table:', error });
    }
});

router.get('/readAll', async (req, res) => {
    try {
        const tableGetAll = await Table.find();

        if(!tableGetAll){
            res.status(409).json({ message: "Tables not found." });
        }
        else{
            res.status(200).json({ data: tableGetAll });
        }
        
    } 
    catch (error) {
      res.status(500).json({ message: 'Error get table:', error });
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
        const tableGet = await Table.findById(id);

        if(!tableGet){
            res.status(409).json({ message: "Table not found." });
        }
        else{
            res.status(200).json({ data: tableGet });
        }
        
    } 
    catch (error) {
      res.status(500).json({ message: 'Error get table:', error });
    }
});

router.get('/readByVenueId/:venueId', async (req, res) => {
    const { venueId } = req.params;

    if(!venueId){
        return res.status(400).json({ message: 'VenueId are required.' });
    }

    if(typeof venueId  !== 'string'){
        return res.status(400).json({ message: 'VenueId must be a string.' });
    }
    
    try {
        const tableGet = await Table.find({ "venueId": venueId });

        if(!tableGet){
            res.status(409).json({ message: "Table not found." });
        }
        else{
            res.status(200).json({ data: tableGet });
        }
        
    } 
    catch (error) {
      res.status(500).json({ message: 'Error get table:', error });
    }
});

router.put('/update', async (req, res) => {
    const { id, seats, name, venueId } = req.body;

    if (!req.body) {
        return res.status(400).json({ message: 'Body can not empty.' });
    }

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Id is required and must be a string.' });
    }

    const updateFields = {};
    if (seats) {
        if (typeof seats !== 'number') {
            return res.status(400).json({ message: 'Seats must be a number.' });
        }
        updateFields.seats = seats;
    }
    if (venueId) {
        if (typeof venueId !== 'string') {
            return res.status(400).json({ message: 'VenueId must be a string.' });
        }
        updateFields.venueId = venueId;
    }
    if (name) {
        if(typeof name !== 'string'){
            return res.status(400).json({ message: 'Name must be a string.' });
        }
        updateFields.name = name;
    }

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
    }
    
    try {
        const venueUpdate = await Table.updateOne(
            { _id: id },
            { $set: updateFields }
        );

        if (venueUpdate.matchedCount === 0) {
            return res.status(404).json({ message: 'Table not found update.' });
        }

        res.status(200).json({ message: 'Table updated successfully.', data: updateFields });
    } 
    catch (error) {
      res.status(500).json({ message: 'Error get table:', error });
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
        const tablefind = Table.find({ "_id": id});
        await tablefind.deleteOne();
  
        res.status(200).json({ message: 'Table delete successfully' });
    } 
    catch (error) {
      res.status(500).json({ message: 'Error delete table:', error });
    }
});

module.exports = router;