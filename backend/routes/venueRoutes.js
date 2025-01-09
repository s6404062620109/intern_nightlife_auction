const express = require('express');
const Venue = require('../schemas/venueSchema');
require('dotenv').config();

const router = express.Router();

router.post('/post', async (req, res) => {
    const { name, address, banner } = req.body;
  
    if (!req.body) {
        return res.status(400).json({ message: 'Body can not empty.' });
    }

    if(!name || !address || !banner){
        return res.status(400).json({ message: 'name, address, banner are required.' });
    }

    if(typeof name !== 'string' || typeof address !== 'string' || typeof banner !== 'string'){
        return res.status(400).json({ message: 'name, address, banner must be a string.' });
    }
  
    try {
        const newVenue = new Venue({
            name,
            address,
            banner
        });
        await newVenue.save();
  
        res.status(200).json({ message: 'Venue post successfully' });
    } 
    catch (error) {
      res.status(500).json({ message: 'Error post venue:', error });
    }
});

router.get('/readAll', async (req, res) => {
  
    try {
        const venueGetAll = await Venue.find();

        if(!venueGetAll){
            res.status(409).json({ message: "Venues not found." });
        }
        else{
            res.status(200).json({ data: venueGetAll });
        }
        
    } 
    catch (error) {
      res.status(500).json({ message: 'Error get venue:', error });
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
        const venueGet = await Venue.findById(id);

        if(!venueGet){
            res.status(409).json({ message: "Venue not found." });
        }
        else{
            res.status(200).json({ data: venueGet });
        }
        
    } 
    catch (error) {
      res.status(500).json({ message: 'Error get venue:', error });
    }
});

router.put('/update', async (req, res) => {
    const { id, name, address, banner } = req.body;

    if (!req.body) {
        return res.status(400).json({ message: 'Body can not empty.' });
    }

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Id is required and must be a string.' });
    }

    const updateFields = {};
    if (name) {
        if (typeof name !== 'string') {
            return res.status(400).json({ message: 'Name must be a string.' });
        }
        updateFields.name = name;
    }
    if (address) {
        if (typeof address !== 'string') {
            return res.status(400).json({ message: 'Address must be a string.' });
        }
        updateFields.address = address;
    }
    if (banner) {
        if (typeof banner !== 'string') {
            return res.status(400).json({ message: 'Banner must be a string.' });
        }
        updateFields.banner = banner;
    }

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
    }
    
    try {
        const venueUpdate = await Venue.updateOne(
            { _id: id },
            { $set: updateFields }
        );

        if (venueUpdate.matchedCount === 0) {
            return res.status(404).json({ message: 'Venue not found update.' });
        }

        res.status(200).json({ message: 'Venue updated successfully.', data: updateFields });
    } 
    catch (error) {
      res.status(500).json({ message: 'Error get venue:', error });
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
        const venuefind = Venue.find({ "_id": id});
        await venuefind.deleteOne();
  
        res.status(200).json({ message: 'Venue delete successfully' });
    } 
    catch (error) {
      res.status(500).json({ message: 'Error delete venue:', error });
    }
});

module.exports = router;