
const bcrypt = require('bcrypt');
const Constants = require("../lib/constants");
const { Register } = require('../models/mongo');
const uuidv1 = require("uuid").v1;

const userRegister = async (req, res) => {
    try {
        const { full_name, email, mobile_number, user_address, password, confirm_password } = req.body;

        if (!full_name || !email || !mobile_number || !password || !confirm_password) {
            return res.status(Constants.BAD_REQUEST).json({
                type: Constants.ERROR_MSG,
                message: "Mandatory Data Missing",
            });
        }

        if (password !== confirm_password) {
            return res.status(Constants.BAD_REQUEST).json({
                type: Constants.ERROR_MSG,
                message: "Password do not match."
            });
        }

        const existingUser = await Register.findOne({
            $or: [{ email }, { mobile_number }]
        });

        if (existingUser) {
            return res.status(Constants.BAD_REQUEST).json({
                type: Constants.ERROR_MSG,
                message: "Email or Mobile number already registered."
            });
        }

        const uid = uuidv1();
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new Register({
            uid,
            full_name,
            email,
            mobile_number,
            user_address,
            password: hashedPassword
        });

        await newUser.save();

        res.status(Constants.CREATED).json({
            type: Constants.SUCCESS,
            message: Constants.SUCCESS_MSG,
            uid: newUser.uid
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(Constants.INTERNAL_ERROR).json({
            type: Constants.ERROR_MSG,
            message: Constants.INTERNAL_SERVER_ERROR
        });
    }
};

module.exports = userRegister;
