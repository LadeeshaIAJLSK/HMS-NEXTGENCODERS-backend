import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getDashboardData = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            dashboardData: {
                totalPackages: user.packages.length,
                activePackages: user.packages.filter(pkg => pkg.status === 'active').length,
                totalSpent: user.totalSpent || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getPackages = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            packages: user.packages
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getMyPackages = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            myPackages: user.packages
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getCart = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            cart: user.cart
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const addToCart = async (req, res) => {
    try {
        const { userId } = req.body;
        const { packageId, quantity = 1 } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const existingItem = user.cart.find(item => item.packageId === packageId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            user.cart.push({ packageId, quantity });
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            cart: user.cart
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const { userId } = req.body;
        const { packageId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.cart = user.cart.filter(item => item.packageId !== packageId);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            cart: user.cart
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const purchasePackages = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.cart.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        // Add cart items to packages
        user.packages.push(...user.cart.map(item => ({
            packageId: item.packageId,
            quantity: item.quantity,
            status: 'active',
            purchaseDate: new Date()
        })));

        // Clear cart
        user.cart = [];
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Packages purchased successfully',
            packages: user.packages
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const assignPackageToDepartment = async (req, res) => {
    try {
        const { userId } = req.body;
        const { packageId, department } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const packageItem = user.packages.find(pkg => pkg.packageId === packageId);
        if (!packageItem) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }

        packageItem.status = 'active';
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Package assigned successfully',
            package: packageItem
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}