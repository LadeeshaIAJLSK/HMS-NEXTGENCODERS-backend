const Product = require("../models/Product");
const Category = require("../models/Category");

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error fetching products" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error fetching product" });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    
    const subcategories = await Category.find({ parentId: categoryId });
    const categoryIds = [categoryId, ...subcategories.map(sub => sub._id)];
    
    const products = await Product.find({ 
      category: { $in: categoryIds } 
    }).populate("category");
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error fetching products by category" });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return res.status(400).json({ error: "Invalid category" });
    }
    
    const newProduct = new Product(req.body);
    await newProduct.save();
    
    const populatedProduct = await Product.findById(newProduct._id).populate("category");
    
    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: error.message || "Error adding product" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    // Validate that the category exists if it's being updated
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({ error: "Invalid category" });
      }
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("category");
    
    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: error.message || "Error updating product" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: error.message || "Error deleting product" });
  }
};
