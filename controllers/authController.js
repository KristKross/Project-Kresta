const User = require("../models/User");
const bcrypt = require("bcrypt");

// @route   POST /auth/register
exports.register = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        // Check if the email already exist
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        // Check if the username already exists
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ success: false, message: "Username already taken" });
        }

        // Uses bcrypt to hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new User record with passwordHash stored directly
        await new User({ username, email, passwordHash: hashedPassword }).save();

        res.status(201).json({ success: true, message: "User registered and logged in successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error saving user" });
    }
};

// @route   POST /auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the email is registered
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        // compare the password with the hashed password in the database
        const validPassword = await bcrypt.compare(password, user.passwordHash);

        // Check if the password is correct
        if (!validPassword) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        res.json({ success: true, message: "Login successful" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error logging in. Please try again later." });
    }
};