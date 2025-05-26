const { User, Wishlist, Product } = require("../models/mongo");
const Constants = require("../lib/constants");

const createWhishlist = async function (req, res) {
  const { user_uid, product_uid } = req.body;

  try {
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

    await Wishlist.deleteMany();

    let wishlist = await Wishlist.findOne({
      user: user_db.id,
      products: { $in: [product_db.id] },
    });
console.log(wishlist)
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: user_db.id,
        products: [product_db.id],
      });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
      }
    }

    await wishlist.save();
    res.status(200).json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getWhishlist = async function (req, res) {
  const { user_uid } = req.params;
  try {
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

    const wishlist = await Wishlist.findOne({ user: user_db.id }).populate(
      "products"
    );
    res.status(200).json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteWhishlist = async function (req, res) {
  const { user_uid, productId } = req.query;

  if (!user_uid || !productId) {
    return res.status(400).json({
      success: false,
      message: "User uid and productId are required",
    });
  }

  try {
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

    const wishlist = await Wishlist.findOne({ user: user_db.id });

    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (product) => product.toString() !== productId.toString()
      );

      await wishlist.save();
    }

    res.status(200).json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getSelecetdWhishlist = async function (req, res) {
  const { user_uid } = req.params;

  try {
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

    const wishlist = await Wishlist.findOne({ user: user_db.id }).populate(
      "products"
    );
    const productIds = wishlist.products.map((product) =>
      product.product_uid.toString()
    );
    res.json({ productIds });
  } catch (err) {
    res.status(500).json({ error: "Wishlist fetch failed" });
  }
};

module.exports = {
  createWhishlist: createWhishlist,
  getWhishlist: getWhishlist,
  deleteWhishlist: deleteWhishlist,
  getSelecetdWhishlist: getSelecetdWhishlist,
};
