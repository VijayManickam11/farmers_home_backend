const Razorpay = require('razorpay');
const crypto = require('crypto');
const Constants = require('../lib/constants');
const { PaymentDetails } = require('../models/mongo');

// console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
// console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);



const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) =>{
    try{

        const { amount, currency="INR", receipt } = req.body;        
        

        if(!amount || !receipt){
            return res.status(Constants.BAD_REQUEST).json({
                type: Constants.ERROR_MSG,
                message: "Amount or Receipt is missing..."
            });
        }

        const order = await razorpayInstance.orders.create({
            amount: amount * 100,
            currency,
            receipt,
            payment_capture: 1
        })

        res.status(Constants.SUCCESS).json({data:order})

    }catch(error){
        console.log("Order creation failed:",error);
        res.status(Constants.INTERNAL_ERROR).json({
            type: Constants.ERROR_MSG,
            message: Constants.INTERNAL_SERVER_ERROR,
        });
    }
};

const verifyPayment = async (req, res) => {
    try{
        const {  razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest('hex');
        
        if(expectedSign == razorpay_signature){
            await PaymentDetails.create({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                payment_verified: true,
                paid_at: new Date(),
            })
            return res.status(Constants.SUCCESS).json({
                type: Constants.SUCCESS,
                message: "Payment Verified"
            });
        }else{
            return res.status(Constants.BAD_REQUEST).json({
                type: Constants.ERROR_MSG,
                message:"Invalid Signature"
            });
        }

    }catch(error){
        console.log(error);
        res.status(Constants.INTERNAL_ERROR).json({
            type: Constants.ERROR_MSG,
            message: Constants.INTERNAL_SERVER_ERROR,
        });
    }
}

module.exports = { createOrder, verifyPayment };