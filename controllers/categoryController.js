const Category = require("../models/Category");

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Error fetching categories" });
  }
};

// Add a new category
exports.addCategory = async (req, res) => {
  try {
    const newCategory = new Category({ name: req.body.name });
    await newCategory.save();
    res.json(newCategory);
  } catch (error) {
    res.status(500).json({ error: "Error adding category" });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: "Error updating category" });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting category" });
  }
};
