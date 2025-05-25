const User = require("../models/User");
const Social = require("../models/Social");
const Premium = require("../models/Premium");
const { initializeSession } = require("../utils/sessionUtil");
const bcrypt = require("bcrypt");
const cloudinary = require("../config/cloudinary");

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
        const newUser = await new User({ username, email, passwordHash: hashedPassword }).save();
        await new Social({ userId: newUser._id }).save();
        await new Premium({ userId: newUser._id }).save();

        // Initialize user session
        initializeSession(req, 
            { user: { 
                _id: newUser._id, 
                username, 
                email
            }
        });

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

        // Initialize user session
        initializeSession(req, {
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            },
        });

        console.log(user)

        res.json({ success: true, message: "Login successful" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error logging in. Please try again later." });
    }
};

// @route   PATCH /auth/update
exports.updateUser = async (req, res) => {
    try {
        const { email, username, profilePicture } = req.body;
        const user = req.session?.userData?.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "User not logged in" });
        }

        const updateData = { email, username };
        if (profilePicture) {
            updateData.profilePicture = profilePicture;
        }

        const updatedUser = await User.findByIdAndUpdate(user._id, updateData, { new: true });
        req.session.userData.user = updatedUser;

        res.json({ success: true, message: "User details updated successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating user details" });
    }
};

// @route   PATCH /auth/update-password
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const sessionUser = req.session?.userData?.user;

        if (!sessionUser) {
            return res.status(401).json({ success: false, message: "User not logged in" });
        }

        const user = await User.findById(sessionUser._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.passwordHash) {
            console.error('Error: Password hash is missing from user data');
            return res.status(500).json({ success: false, message: "Internal server error: Missing password hash" });
        }

        const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!validPassword) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.passwordHash = hashedPassword;
        await user.save();

        req.session.userData.user.passwordHash = hashedPassword;

        res.json({ success: true, message: "Password updated successfully!" });

    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ success: false, message: "Error updating password" });
    }
};

// @route   GET /auth/user
exports.getUser = async (req, res) => {
    try {
        const sessionUser = req.session?.userData?.user;

        if (!sessionUser) {
            return res.status(401).json({ authenticated: false });
        }

        const user = await User.findById(sessionUser._id).select('email username createdAt profilePicture');
        const socialData = await Social.findOne({ userId: user._id });
        const premiumData = await Premium.findOne({ userId: user._id });

        res.json({
            authenticated: true,
            user,
            social: socialData,
            premium: premiumData,
        });

    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: "Error retrieving user details" });
    }
};

// @route   GET /auth/profile-picture/:folderName/:publicId
exports.getProfilePicture = async (req, res) => {
    try {
        const { folderName, publicId, resourceType } = req.params;
        const path = `${folderName}/${publicId}`;

        if (!publicId) return res.status(400).json({ error: "Image ID required" });

        const signedUrl = cloudinary.url(path, {
          sign_url: true,
          type: "authenticated",
          resource_type: resourceType,
        });

        res.json({ success: true, imageUrl: signedUrl });

    } catch (error) {
        console.error("Error retrieving profile picture:", error);
        res.status(500).json({ error: "Error retrieving profile picture" });
    }
};

// @route   POST auth/logout
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error logging out" });
        }
        res.clearCookie("connect.sid");
        res.json({ success: true, message: "Logged out successfully" });
    });
};

// @route   DELETE /auth/delete
exports.deleteAccount = async (req, res) => {
    try {
        const sessionUser = req.session?.userData?.user;

        if (!sessionUser) {
            return res.status(401).json({ success: false, message: "User not logged in" });
        }

        const user = await User.findByIdAndDelete(sessionUser._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await Social.findOneAndDelete({ userId: user._id });
        await Premium.findOneAndDelete({ userId: user._id });

        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ success: false, message: "Error deleting account" });
            }
            res.clearCookie("connect.sid");
            res.json({ success: true, message: "Account deleted successfully" });
        });

    } catch (error) {
        console.error("Error deleting user account:", error);
        res.status(500).json({ success: false, message: "Error deleting user account" });
    }
};

