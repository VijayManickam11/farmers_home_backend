const Product = require('../models/mongo').Product;

const Constants = require('../lib/constants');
const Util = require('../lib/util');

const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');
const _ = require('underscore');
const uuidv1 = require('uuid').v1;
const moment = require('moment');
const serverConfig = require("../../config/environment/serverConfig");



const createProducts = async function (req, res) {
    var product_data = req.body;
    console.log(product_data,"product_data")
    if (!product_data.name || !product_data.category || !product_data.price || !product_data.stock || product_data.is_available === undefined) {
        res.status(Constants.BAD_REQUEST);
        return res.send({ type: Constants.ERROR_MSG, message: "Mandatory Data Missing" });
    }    

    product_data['product_id'] = uuidv1();

    let saved_data = await Product(product_data).save();
    if (saved_data) {
        res.status(Constants.SUCCESS);
        return res.send({ type: Constants.SUCCESS_MSG, message: Constants.CREATION_SUCCESS, data: { product_data: saved_data } });
    } else {
        return res.status(Constants.INTERNAL_ERROR).send({ type: Constants.ERROR_MSG, message: Constants.INTERNAL_SERVER_ERROR });
    }
}



module.exports = {
    createProducts: createProducts,    
}