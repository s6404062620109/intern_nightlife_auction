const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
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

    const verificationToken = jwt.sign({ userId: newUser._id }, process.env.SECRET_VERIFRIED, { expiresIn: '1h' });

    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationUrl = `${process.env.CLIENT_URL}/auth/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: newUser.email,
      subject: 'Verify Your Email',
      html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    });

    res.status(201).json({ message: 'Registered successfully. Please verify your email.' });
  } 
  catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Verification token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_VERIFRIED);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    user.verified = true;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying email', error });
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
