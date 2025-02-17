const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
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
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2a9d8f;">Email Verification Required</h2>
          <p>Dear ${name},</p>
          <p>Thank you for registering on our platform. To complete your registration and activate your account, we kindly ask you to verify your email address.</p>
          <p style="margin: 20px 0;">
            <a 
              href="${verificationUrl}" 
              style="
                display: inline-block; 
                padding: 10px 20px; 
                background-color: #2a9d8f; 
                color: #ffffff; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;"
            >
              Verify Email Address
            </a>
          </p>
          <p>If you need complete your registration, please confirm in 1 hour after seen this email.</p>
          <p style="font-weight: bold;">The Nightlife Auction Team</p>
        </div>
      `,
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

router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const lastResetTimestamp = user.updatedAt.getTime();
    const currentTime = Date.now();
    const timeSinceLastRequest = currentTime - lastResetTimestamp;

    if (timeSinceLastRequest < 3600000) { 
      const timeRemaining = Math.ceil((3600000 - timeSinceLastRequest) / 60000);
      return res.status(400).json({
        message: `You have already requested a password reset. Please wait ${timeRemaining} minutes before trying again.`,
      });
    }

    const resetToken = jwt.sign({ userId: user._id }, process.env.SECRET_RESET, { expiresIn: '1h' });
    user.updatedAt = new Date(); 
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.CLIENT_URL}/auth/verify-reset-token?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2a9d8f;">Password Reset Request</h2>
          <p>Dear ${user.name},</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <p style="margin: 20px 0;">
            <a 
              href="${resetUrl}" 
              style="
                display: inline-block; 
                padding: 10px 20px; 
                background-color: #2a9d8f; 
                color: #ffffff; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;"
            >
              Reset Password
            </a>
          </p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <p style="font-weight: bold;">The Nightlife Auction Team</p>
        </div>
      `,
    });

    res.status(200).json({ message: 'Reset password email sent. Please check your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reset password email', error });
  }
});

router.get('/verify-reset-token', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Reset token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_RESET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    res.redirect(`${process.env.FRONTEND_URL}/auth/change-password?token=${token}`);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying reset token', error });
  }
});

router.post('/change-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_RESET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error });
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
    if (!user.verified){
      return res.status(400).json({ message: 'Please verified your email.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('authToken', token, {
      maxAge: 3600000,
      secure: true,
      httpOnly: true,
      sameSite: 'none',
    })

    res.status(200).json({ message: 'Login successful' });
  } 
  catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('authToken', {
    secure: true,
    httpOnly: true,
    sameSite: 'none',
  });
  res.status(200).json({ message: 'Logout successful' });
});

router.get('/authorization', async (req, res) => {
  const authToken = req.cookies.authToken;

  try {
    if (!authToken) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const userPackage = jwt.verify(authToken, process.env.JWT_SECRET);
    const id = userPackage.userId;

    const user = await User.findById(id);
    if (user) {
      return res.status(200).json({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        coin: user.coin,
        profileImg: user.profileImg,
        payment_method: user.payment_method
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error authorizing user', error });
  }
});

router.get('/readByOwnerId/:id', async (req, res) => {
  const { id } = req.params;

  if(!id){
      return res.status(400).json({ message: 'Id are required.' });
  }

  if(typeof id  !== 'string'){
      return res.status(400).json({ message: 'Id must be a string.' });
  }
  
  try {
      const user = await User.findById(id);

      if(!user){
          res.status(409).json({ message: "User not found." });
      }
      else{
          res.status(200).json({ data: user });
      }
      
  } 
  catch (error) {
    res.status(500).json({ message: 'Error get user:', error });
  }
});

router.post("/add-payment_methods", async (req, res) => {
  const { userId, payment_methods } = req.body;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID format." });
  }

  if (!Array.isArray(payment_methods) || payment_methods.length === 0) {
    return res.status(400).json({ message: "User ID and a valid payment method array are required." });
  }

  for (let method of payment_methods) {
    if (!method.name || !method.code) {
      return res.status(401).json({ message: "Each payment method must have a name and code." });
    }

    if (typeof method.name !== "string" || typeof method.code !== "string") {
      return res.status(400).json({ message: "Each payment method name and code must be a string." });
    }
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.payment_method.push(...payment_methods);

    await user.save();
    res.status(200).json({ message: "Payment method added successfully", user });
    
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


module.exports = router;
