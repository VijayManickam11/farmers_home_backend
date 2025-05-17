const Wishlist = require("../models/mongo").Wishlist;

const createWhishlist = async function (req, res) {

  const { userId, productId } = req.body;

  console.log(req.body, "whishlist")

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

    const { userId, productId } = req.body;

  try {
    const wishlist = await Wishlist.findOne({ userId });
    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (product) => product.toString() !== productId
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
