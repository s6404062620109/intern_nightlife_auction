const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Venue = require('../schemas/venueSchema');
const User = require('../schemas/userSchema');
require('dotenv').config();

const router = express.Router();

const uploadDir = path.join(__dirname, '../Venues');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const fileName = `${Date.now()}${ext}`;
        cb(null, fileName);
    }
});
const upload = multer({ storage });

router.post('/post', upload.single('banner'), async (req, res) => {
    const { name, address, ownerId, contact } = req.body;
    const bannerFile = req.file;

    if (!name || !address || !ownerId || !contact || !bannerFile) {
        return res.status(400).json({ message: 'Name, address, ownerId, contact, and banner file are required.' });
    }

    if (!contact.phone || !contact.email || !contact.facebook) {
        return res.status(400).json({ message: 'Contact information must include phone, email, and facebook.' });
    }

    try {
        const findOwner = await User.findById(ownerId);
        if (!findOwner) {
            return res.status(401).json({ message: 'Not found user.' });
        }

        const newVenue = new Venue({
            name,
            address,
            banner: bannerFile.filename,
            ownerId,
            contact: {
                phone: contact.phone,
                email: contact.email,
                facebook: contact.facebook
            }
        });

        await newVenue.save();
        res.status(200).json({ message: 'Venue added successfully!', banner: bannerFile.filename });
    } 
    catch (error) {
        console.error('Error adding venue:', error);
        res.status(500).json({ message: 'Error adding venue', error });
    }
});

router.get('/readAllMyVenue/:ownerId', async (req, res) => {
    const { ownerId } = req.params;

    if(!ownerId){
        return res.status(400).json({ message: "OwnerId is required." });
    }
  
    try {
        const venueGetAll = await Venue.find({ ownerId: ownerId });

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

router.get('/readAll', async (req, res) => {
    
    try {
        const venueGet = await Venue.find();

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
    const { id, name, address, banner, ownerId, contact } = req.body;

    if (!req.body) {
        return res.status(400).json({ message: 'Body can not empty.' });
    }

    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Id is required and must be a valid ObjectId string.' });
    }

    if (!ownerId || typeof ownerId !== 'string' || !mongoose.Types.ObjectId.isValid(ownerId)) {
        return res.status(400).json({ message: 'OwnerId is required and must be a valid ObjectId string.' });
    }

    const findOwner = await User.findById(ownerId);

    if(!findOwner){
        return res.status(401).json({ message: 'Not found user.' });
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

    const currentVenue = await Venue.findById(id);
    if (!currentVenue) {
        return res.status(404).json({ message: 'Venue not found.' });
    }
    
    if (contact) {
        const contactFields = { ...currentVenue.contact };
        if (contact.phone !== undefined) {
            if (typeof contact.phone !== 'string') {
                return res.status(400).json({ message: 'Phone must be a string.' });
            }
            contactFields.phone = contact.phone;
        }
        if (contact.email !== undefined) {
            if (typeof contact.email !== 'string') {
                return res.status(400).json({ message: 'Email must be a string.' });
            }
            contactFields.email = contact.email;
        }
        if (contact.facebook !== undefined) {
            if (typeof contact.facebook !== 'string') {
                return res.status(400).json({ message: 'Facebook must be a string.' });
            }
            contactFields.facebook = contact.facebook;
        }
        if (Object.keys(contactFields).length > 0) {
            updateFields.contact = contactFields;
        }   
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