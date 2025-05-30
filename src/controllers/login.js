const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Constants = require('../../src/lib/constants');
const { User } = require('../models/mongo');
const Router = express;

const JWT_SECRET = Constants.ACCESS_TOKEN_SECERT;

const userLogin = async (req, res) => {
    try{

        const {email, password } = req.body;
        
        

        if(!email || !password){
            return res.status(Constants.BAD_REQUEST).json({
                type: Constants.ERROR_MSG,
                message: "Email and password are required."
            })
        }

        const user = await User.findOne({email:email});
        
        if(!user){
            return res.status(Constants.UNAUTHORIZED).json({
                type: Constants.ERROR_MSG,
                message: "Invalid email."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(Constants.UNAUTHORIZED).json({
                type: Constants.ERROR_MSG,
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            {uid: user.user_uid, email: user.email, role: user.role},
            JWT_SECRET,
            {expiresIn: '1d'}
        );

        return res.status(Constants.SUCCESS).json({
            type: Constants.SUCCESS,
            message: Constants.SUCCESS_MSG,
            token,
            user:{
                user_uid: user.user_uid,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                address: user.user_address,
                mobileNumber: user.mobile_number,
            }
        })

    }catch(error){
        console.error('Login error:', error);
        return res.status(Constants.INTERNAL_ERROR).json({
            type: Constants.ERROR_MSG,
            message: Constants.INTERNAL_SERVER_ERROR
        });
    }
}


module.exports = userLogin;