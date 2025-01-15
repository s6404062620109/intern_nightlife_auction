const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../schemas/userSchema');
require('dotenv').config();

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, password: hashedPassword, name });
    await newUser.save();    

    res.status(201).json({ message: 'Registered successfully' });
  } 
  catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } 
  catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

router.get('/authorization', async (req, res) => {
  const authToken = req.headers['authorization'];
    let authtokenvalue = ''
    if ( authToken ){
      authtokenvalue = authToken.split(' ')[1];
    }
    
    const userPackage = jwt.verify(authtokenvalue, process.env.JWT_SECRET);

    try{
      if(userPackage){
        const id = userPackage.userId;
        const user = await User.findOne({ "_id": id });
        
        if(user){
          res.status(200).json({ 
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            coin: user.coin 
          });
        }
      }
    } 
    catch(error) {
      console.log(error);
    }
    
});

module.exports = router;
