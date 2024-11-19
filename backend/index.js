const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const port = 4000;
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const Product = require('./Schema/ProductSchema');
const User = require('./Schema/UserSchema');

// Encoding password for MongoDB Atlas
const password = encodeURIComponent("B*Q3mJDX_f7zZb4");

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(`mongodb+srv://lennyjohn399:${password}@cluster0.ce7uvcp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => { console.log('Database connected successfully'); })
    .catch(err => { console.error(`Database connection error: ${err}`); });

// Static files
app.use('/images', express.static('upload/images'));

// Root endpoint
app.get('/', (req, res) => {
    res.send('My Express server is ready to handle requests');
});

// Configure multer for file uploads
const mystorage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: mystorage });

// Upload endpoint
app.post('/upload', upload.single('product'), (req, res) => {
    try {
        res.json({
            success: 1,
            image_url: `http://localhost:${port}/images/${req.file.filename}`
        });
    } catch (error) {
        res.status(500).json({ success: 0, error: "File upload failed" });
    }
});

// Add product
app.post('/addproduct', async (req, res) => {
    try {
        let products = await Product.find({});
        let id = products.length > 0
            ? products.slice(-1)[0].id + 1
            : 1;

        const product = new Product({
            id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });

        await product.save();
        res.json({ success: 1, "mynew product": product });
    } catch (error) {
        res.status(500).json({ success: 0, error: "Failed to add product" });
    }
});

// Remove product
app.post('/removeproduct', async (req, res) => {
    try {
        await Product.findOneAndDelete({ id: req.body.id });
        res.json({ success: true, name: req.body.name });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to remove product" });
    }
});

// Get all products
app.get('/allproducts', async (req, res) => {
    try {
        const products = await Product.find({});
        res.send(products);
    } catch (error) {
        res.status(500).json({ success: 0, error: "Failed to fetch products" });
    }
});

// Signup
app.post('/signup', async (req, res) => {
    try {
        const check = await User.findOne({ email: req.body.email });
        if (check) {
            return res.json({ success: false, errors: "User already exists with the same email" });
        }

        const cart = Array(300).fill(0).reduce((acc, _, idx) => {
            acc[idx] = 0;
            return acc;
        }, {});

        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            cartData: cart
        });

        await user.save();

        const data = { user: { id: user.id } };
        const token = jwt.sign(data, 'secret_ecom');
        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ success: false, error: "Signup failed" });
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            if (req.body.password === user.password) {
                const data = { user: { id: user.id } };
                const token = jwt.sign(data, 'secret_ecom');
                res.json({ success: true, token, msg: "Login successful" });
            } else {
                res.json({ success: false, errors: "Wrong password" });
            }
        } else {
            res.json({ success: false, errors: "Email not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: "Login failed" });
    }
});

// Fetch user middleware
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ errors: "Please authenticate using a valid token" });
    }

    try {
        const data = jwt.verify(token, 'secret_ecom');
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ errors: "Invalid token" });
    }
};

// Add to cart
app.post('/addtocart', fetchUser, async (req, res) => {
    try {
        let userData = await User.findById(req.user.id);
        userData.cartData[req.body.itemId] += 1;
        await userData.save();
        res.send("Added");
    } catch (error) {
        res.status(500).send({ errors: "Failed to add to cart" });
    }
});

// Remove from cart
app.post('/removefromcart', fetchUser, async (req, res) => {
    try {
        let userData = await User.findById(req.user.id);
        if (userData.cartData[req.body.itemId] > 0) {
            userData.cartData[req.body.itemId] -= 1;
            await userData.save();
        }
        res.send("Removed");
    } catch (error) {
        res.status(500).send({ errors: "Failed to remove from cart" });
    }
});

// Get cart
app.post('/getcart', fetchUser, async (req, res) => {
    try {
        let userData = await User.findById(req.user.id);
        res.json(userData.cartData);
    } catch (error) {
        res.status(500).send({ errors: "Failed to fetch cart" });
    }
});

// Popular products
app.get('/popularinwomen', async (req, res) => {
    try {
        let products = await Product.find({ category: "women" });
        res.send(products.slice(0, 4));
    } catch (error) {
        res.status(500).json({ success: 0, error: "Failed to fetch popular products" });
    }
});

// Start server
app.listen(port, (err) => {
    if (err) {
        console.error('Server error:', err);
    } else {
        console.log(`Server is running at port: ${port}`);
    }
});
