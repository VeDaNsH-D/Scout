const bcrypt = require("bcrypt");
const User = require("../schemas/user_schema");
const generateToken = require("../utils/generate_token");

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const sanitizeUser = (user) => {
    const userObject = user.toObject();
    delete userObject.password_hash;
    return userObject;
};

const register = async (req, res) => {
    try {
        const {
            full_name,
            email,
            password,
            company_name,
            company_website
        } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                message: "email and password are required"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: "Email already exists" });
        }

        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Create user document
        const user = await User.create({
            full_name: full_name || null,
            email: email.toLowerCase(),
            password_hash,
            company_name: company_name || null,
            company_website: company_website || null
        });

        // Generate JWT token
        const token = generateToken(user);

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: sanitizeUser(user)
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ message: "email and password are required" });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.password_hash) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = generateToken(user);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: sanitizeUser(user)
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        // req.user is attached by protect middleware after token verification
        const user = await User.findById(req.user.userId).select("-password_hash");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser
};
