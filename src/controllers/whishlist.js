const Wishlist = require("../models/mongo").Wishlist;

const createWhishlist = async function (req, res) {

  const { userId, productId } = req.body;
 

   try {
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [productId] });
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
    const { userId } = req.params;
  try {
    const wishlist = await Wishlist.findOne({ userId }).populate("products");
    res.status(200).json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

const deleteWhishlist = async function (req, res) {

  const { userId, productId } = req.query;

  
  if (!userId || !productId) {
    return res.status(400).json({
      success: false,
      message: "userId and productId are required",
    });
  }

  try {
    const wishlist = await Wishlist.findOne({ userId });

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
}

const getSelecetdWhishlist = async function (req, res) {

  const { userId } = req.params;

  try {
    const wishlist = await Wishlist.findOne({ userId }).populate('products');
    const productIds = wishlist.products.map((product) => product._id.toString());
    res.json({ productIds });
  } catch (err) {
    res.status(500).json({ error: 'Wishlist fetch failed' });
  }

};



module.exports = {
  createWhishlist: createWhishlist,
  getWhishlist:getWhishlist,
  deleteWhishlist:deleteWhishlist,
  getSelecetdWhishlist:getSelecetdWhishlist,
  
};
