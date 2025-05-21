require("dotenv").config();
const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const cors = require("cors");
const sessionMiddleware = require("./config/session");

const app = express();

// Database connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// Middleware
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(sessionMiddleware);

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'dashboard.html'));
});

app.get('/sidebar', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'sidebar.html'));
});

// API Routes
const authRoutes = require("./routes/authRoute");
app.use('/auth', authRoutes);

const socialRoutes = require("./routes/socialsRoute");
app.use('/api/social', socialRoutes);

const instagramRoutes = require("./routes/instagramRoute");
app.use('/api/instagram', instagramRoutes);

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));