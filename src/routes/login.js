const express = require('express');
const User = require('../model');
const bycrpt = require('bcryptjs');
const generateToken = require('../utils/token');
const verifyToken = require('../middleware/middleWare');
const nodemailer = require('nodemailer')

const router = express.Router();

router.get('/test', (req, res) => res.json({ message: "API Testing Successful."}));

router.post('/userlogin', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({email});
    console.log(user);
    
    if(!user){
        const hashedPassword = await bycrpt.hash(password, 10);

        const newUser = new User({email, password: hashedPassword});

        await newUser.save();

        return res.status(201).json({message : "User Created Successfull."})
    }

    res.status(404).json({message: "User Already exists"})
});

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({email});

    if(!user){
        return res.status(404).json({message: "User Not Found."});
    };

    const isMatchedUser = await bycrpt.compare(password, user.password);
    if(!isMatchedUser){
        return res.status(401).json({message: "Incorrect Password."})
    }

    const token = generateToken(user);
    res.json({token})
})

router.get('/data', verifyToken, async (req, res) => {
    res.json({message: `Welcome ${req.user.email}! This is protected data`});
})

router.post('/reset-password', async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({email});

    if(!user){
        res.status(401).json({message: "User not found"});
    }

    const token = Math.random().toString(36).slice(-8);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now + 360000; //1hour

    await user.save();

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth:{
            user:"example@gmail.com", //sender email id
            pass:"djsfksjdfksjdf" //google security 2-stpe verification and custompassword nodemailer
        }
    });

    const message = {
        from : "example@gmail.com", //sender email id
        to: "narayana@gmail.com", // receiver email or requester email id
        subject: "Password Reset request",
        text: `You are receiving this email because you (or someone else) has requested a password reset from your account. \n\n Please use the following token to rest your password: ${token} \n\n if you did not request a password reset, please ignore this email.`    
    }

    transporter.sendMail(message, (err, info) =>{
        if(err){
            res.status(404).json({message: "Something went wrong, try again!!!"})
        }
        res.status(201).json({message:"Email Sent" + info.response})
    });
})

module.exports = router;