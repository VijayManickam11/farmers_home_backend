const Cart = require("../models/mongo").Cart;
const User = require("../models/mongo").User;
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

const createCart = async function (req, res) {
  const { product_uid, user_uid } = req.body;

  try {
    if (!product_uid || !user_uid) {
      res.status(Constants.BAD_REQUEST);
      return res.send({
        type: Constants.ERROR_MSG,
        message: "Mandatory Data Missing",
      });
    }

    let user_db = await User.findOne({
      user_uid: user_uid,
      is_active: true,
      is_deleted: false,
    });

    if (!user_db) {
      res.status(Constants.NOT_FOUND);
      return res.send({
        type: Constants.ERROR_MSG,
        message: "Invalid user uid",
      });
    }

    let product_db = await Product.findOne({
      product_uid: product_uid,
      is_active: true,
      is_deleted: false,
    });

    if (!product_db) {
      res.status(Constants.NOT_FOUND);
      return res.send({
        type: Constants.ERROR_MSG,
        message: "Invalid product uid",
      });
    }

    //   let user_db = await User.findOne({
    //     user_uid: user_uid,
    //     is_active: true,
    //     is_deleted: false,
    //   });

    //   if (!user_db) {
    //     res.status(Constants.NOT_FOUND);
    //     return res.send({
    //       type: Constants.ERROR_MSG,
    //       message: "Invalid user uid",
    //     });
    //   }

    let cart_data = await Cart.findOne({
      product: product_db._id,
      user: user_db.id,
    });

    if (!cart_data) {
      const createData = {
        cart_uid: uuidv1(),
        product: product_db._id,
        user: user_db._id,
      };

      cart_data = await Cart(createData).save();
    } else {
      cart_data["quantity"] = cart_data["quantity"] + 1;
      console.log(cart_data);
      cart_data.save();
    }

    if (cart_data) {
      res.status(Constants.SUCCESS);
      return res.send({
        type: Constants.SUCCESS_MSG,
        message: Constants.CREATION_SUCCESS,
        data: cart_data,
      });
    } else {
      return res.status(Constants.INTERNAL_ERROR).send({
        type: Constants.ERROR_MSG,
        message: Constants.INTERNAL_SERVER_ERROR,
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(Constants.INTERNAL_ERROR)
      .send({ type: Constants.ERROR_MSG, message: "Internal server error" });
  }
};

const updateCart = async function (req, res) {
  try {
    const cartUid = req.params.cart_uid;
    const updateData = req.body;

    if (!cartUid) {
      return res
        .status(Constants.BAD_REQUEST)
        .send({ type: Constants.ERROR_MSG, message: "Cart ID Missing" });
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
    const updatedCart = await Cart.findOneAndUpdate(
      { cart_uid: cartUid, is_active: true, is_deleted: false },
      { ...updateData, updated_at: new Date() },
      { new: true }
    );

    if (!updatedCart) {
      return res
        .status(Constants.NOT_FOUND)
        .send({ type: Constants.ERROR_MSG, message: "Cart not found" });
    }

    return res.status(Constants.SUCCESS).send({
      type: Constants.SUCCESS_MSG,
      message: "Cart updated successfully",
      data: updatedCart,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(Constants.INTERNAL_ERROR)
      .send({ type: Constants.ERROR_MSG, message: "Internal server error" });
  }
};

const getAllCart = async function (req, res) {
  try {
    const { user_uid } = req.params;

    if (!user_uid) {
      res.status(Constants.BAD_REQUEST);
      return res.send({
        type: Constants.ERROR_MSG,
        message: "Mandatory Data Missing",
      });
    }

    let user_db = await User.findOne({
      user_uid: user_uid,
      is_active: true,
      is_deleted: false,
    });

    if (!user_db) {
      res.status(Constants.NOT_FOUND);
      return res.send({
        type: Constants.ERROR_MSG,
        message: "Invalid user uid",
      });
    }


    const getCart = await Cart.find(
      {
        is_active: true,
        is_deleted: false,
        user: user_db.id
      },
      "-_id"
    )
      .populate({ path: "product", select: "-_id" })
      .lean();
    console.log(getCart);

    return res.status(Constants.SUCCESS).send({
      type: Constants.SUCCESS_MSG,
      message: "Cart fetched successfully",
      data: getCart,
    });
  } catch (error) {
    console.error(error);
    return res.status(Constants.INTERNAL_ERROR).send({
      type: Constants.ERROR_MSG,
      message: "Internal server error",
    });
  }
};

const getSingleCart = async function (req, res) {
  try {
    let cartUid = req.params.cart_uid;

    if (!cartUid) {
      res.status(Constants.BAD_REQUEST);
      return res.send({
        type: Constants.ERROR_MSG,
        message: "Mandatory Data Missing",
      });
    }

    let cart_db = await Cart.findOne({
      cart_uid: cartUid,
      is_active: true,
      is_deleted: false,
    });

    if (!cart_db) {
      res.status(Constants.NOT_FOUND);
      return res.send({ type: Constants.ERROR_MSG, message: "Invalid ID" });
    }

    res.status(Constants.SUCCESS);
    return res.send({
      type: Constants.SUCCESS_MSG,
      data: cart_db,
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

const deleteCart = async function (req, res) {
  let cartUid = req.params.cart_uid;

  // Validate the cart ID parameter
  if (!cartUid) {
    return res.status(Constants.BAD_REQUEST).send({
      type: Constants.ERROR_MSG,
      message: "Mandatory Data Missing",
    });
  }

  let cart_db = await Cart.findOne({
    cart_uid: cartUid,
    is_active: true,
    is_deleted: false,
  });

  console.log("Requested Cart:", cart_db);

  if (!cart_db) {
    return res.status(Constants.NOT_FOUND).send({
      type: Constants.ERROR_MSG,
      message: "Invalid UID",
    });
  }

  cart_db.is_deleted = true;

  let updated_data = await cart_db.save();

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
  createCart: createCart,
  updateCart: updateCart,
  getAllCart: getAllCart,
  getSingleCart: getSingleCart,
  deleteCart: deleteCart,
};
