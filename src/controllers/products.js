const Product = require("../models/mongo").Product;

const Constants = require("../lib/constants");
const Util = require("../lib/util");

const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");
const _ = require("underscore");
const uuidv1 = require("uuid").v1;
const moment = require("moment");
const serverConfig = require("../../config/environment/serverConfig");

const createProducts = async function (req, res) {
  var product_data = req.body;

  if (
    !product_data.name ||
    !product_data.category ||
    !product_data.price ||
    !product_data.stock ||
    product_data.is_available === undefined
  ) {
    res.status(Constants.BAD_REQUEST);
    return res.send({
      type: Constants.ERROR_MSG,
      message: "Mandatory Data Missing",
    });
  }

  const image_file = req.file;

  if (image_file) {
    const base64 = image_file.buffer.toString("base64");
    const mimeType = image_file.mimetype;
    const base64Image = `data:${mimeType};base64,${base64}`;

    if (base64Image) {
      product_data["base64Image"] = base64Image;
    }
  }

  product_data["product_uid"] = uuidv1();

  let saved_data = await Product(product_data).save();
  if (saved_data) {
    res.status(Constants.SUCCESS);
    return res.send({
      type: Constants.SUCCESS_MSG,
      message: Constants.CREATION_SUCCESS,
      data: { product_data: saved_data },
    });
  } else {
    return res.status(Constants.INTERNAL_ERROR).send({
      type: Constants.ERROR_MSG,
      message: Constants.INTERNAL_SERVER_ERROR,
    });
  }
};

const updateProduct = async function (req, res) {
  try {
    const productUid = req.params.product_uid;
    const updateData = req.body;

    if (!productUid) {
      return res
        .status(Constants.BAD_REQUEST)
        .send({ type: Constants.ERROR_MSG, message: "Product ID Missing" });
    }

    const image_file = req.file;

    if (image_file) {
      const base64 = image_file.buffer.toString("base64");
      const mimeType = image_file.mimetype;
      const base64Image = `data:${mimeType};base64,${base64}`;

      if (base64Image) {
        updateData["base64Image"] = base64Image;
      }
    }

    // Update
    const updatedProduct = await Product.findOneAndUpdate(
      { product_uid: productUid, is_active: true, is_deleted: false },
      { ...updateData, updated_at: new Date() },
      { new: true }
    );

    if (!updatedProduct) {
      return res
        .status(Constants.NOT_FOUND)
        .send({ type: Constants.ERROR_MSG, message: "Product not found" });
    }

    return res.status(Constants.SUCCESS).send({
      type: Constants.SUCCESS_MSG,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(Constants.INTERNAL_ERROR)
      .send({ type: Constants.ERROR_MSG, message: "Internal server error" });
  }
};

const getAllProducts = async function (req, res) {
  try {
    const getProducts = await Product.find({
      is_active: true,
      is_deleted: false,
    }).lean();

    return res.status(Constants.SUCCESS).send({
      type: Constants.SUCCESS_MSG,
      message: "Products fetched successfully",
      data: getProducts,
    });
  } catch (error) {
    console.error(error);
    return res.status(Constants.INTERNAL_ERROR).send({
      type: Constants.ERROR_MSG,
      message: "Internal server error",
    });
  }
};

const getSingleProducts = async function (req, res) {
  try {
    let productUid = req.params.product_uid;

    if (!productUid) {
      res.status(Constants.BAD_REQUEST);
      return res.send({
        type: Constants.ERROR_MSG,
        message: "Mandatory Data Missing",
      });
    }

    let product_db = await Product.findOne({
      product_uid: productUid,
      is_active: true,
      is_deleted: false,
    });

    if (!product_db) {
      res.status(Constants.NOT_FOUND);
      return res.send({ type: Constants.ERROR_MSG, message: "Invalid ID" });
    }

    res.status(Constants.SUCCESS);
    return res.send({
      type: Constants.SUCCESS_MSG,
      data: product_db,
    });
  } catch (error) {
    console.error("Error: ", error);
    res.status(Constants.INTERNAL_ERROR);
    return res.send({
      type: Constants.ERROR_MSG,
      message: Constants.INTERNAL_SERVER_ERROR,
    });
  }
};

const deleteProducts = async function (req, res) {
  let productUid = req.params.product_uid;

  // Validate the product ID parameter
  if (!productUid) {
    return res.status(Constants.BAD_REQUEST).send({
      type: Constants.ERROR_MSG,
      message: "Mandatory Data Missing",
    });
  }

  let product_db = await Product.findOne({
    product_uid: productUid,
    is_active: true,
    is_deleted: false,
  });

  console.log("Requested Product:", product_db);

  if (!product_db) {
    return res.status(Constants.NOT_FOUND).send({
      type: Constants.ERROR_MSG,
      message: "Invalid UID",
    });
  }

  product_db.is_deleted = true;

  let updated_data = await product_db.save();

  if (updated_data) {
    return res.send({
      type: Constants.SUCCESS_MSG,
      message: Constants.DELETION_SUCCESS,
    });
  } else {
    return res.status(Constants.INTERNAL_ERROR).send({
      type: Constants.ERROR_MSG,
      message: Constants.INTERNAL_SERVER_ERROR,
    });
  }
};

module.exports = {
  createProducts: createProducts,
  updateProduct: updateProduct,
  getAllProducts: getAllProducts,
  getSingleProducts: getSingleProducts,
  deleteProducts: deleteProducts,
};
