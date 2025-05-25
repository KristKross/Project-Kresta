require("dotenv").config();
const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const cors = require("cors");
const sessionMiddleware = require("./config/session");
const isAuthenticated = require("./middleware/sessionAuth");
const checkPremiumTier = require("./middleware/checkPremiumTier");
const checkAccountLink = require("./middleware/checkAccountLink");

const app = express();

// Database connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(sessionMiddleware);

// Serve static files
app.get('/', (req, res) => {
    if (req.session.userData?.user) {
        return res.redirect('/dashboard');
    }
    return res.redirect('/home');
});

app.get('/home', (req, res) => {
    return res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'contact.html'));
});

app.get('/pricing', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'pricing.html'));
});

app.get('/login', (req, res) => {
    if (req.session.userData?.user) return res.redirect('/dashboard');
    res.sendFile(path.join(__dirname, 'dist', 'login.html'));
});

app.get('/register', (req, res) => {
    if (req.session.userData?.user) return res.redirect('/dashboard');
    res.sendFile(path.join(__dirname, 'dist', 'register.html'));
});

app.get('/401', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', '401.html'));
});

app.get('/403', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', '403.html'));
});

app.get('/404', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', '404.html'));
});

app.get('/dashboard', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'dashboard.html'));
});

app.get('/creators', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'creators.html'));
});

app.get('/tasks', isAuthenticated, checkPremiumTier, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'tasks.html'));
});

app.get('/planner', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'planner.html'));
});

app.get('/analytics', isAuthenticated, checkAccountLink, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'analytics.html'));
});

app.get('/profile', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'profile.html'));
});

app.get('/notification', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'notification.html'));
});

app.use(express.static(path.join(__dirname, 'dist')));

// API Routes
const authRoutes = require("./routes/authRoute");
app.use('/auth', authRoutes);

const socialRoutes = require("./routes/socialsRoute");
app.use('/api/social', isAuthenticated, socialRoutes);

const instagramRoutes = require("./routes/instagramRoute");
app.use('/api/instagram', isAuthenticated, instagramRoutes);

const workspaceRoutes = require("./routes/workspaceRoute");
app.use('/api/workspace', isAuthenticated, checkPremiumTier, workspaceRoutes);

const taskRoutes = require("./routes/taskRoute");
app.use('/api/task', isAuthenticated, checkPremiumTier, taskRoutes);

const uploadRoutes = require("./routes/uploadRoute");
app.use('/api', uploadRoutes);

const notificationRoutes = require("./routes/notificationRoute");
app.use('/api/notifications', isAuthenticated, notificationRoutes);


app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'dist', '404.html'));
});

app.use((req, res) => {
    return res.status(401).sendFile(path.join(__dirname, 'dist', '401.html'));
});

app.use((req, res) => {
    return res.status(403).sendFile(path.join(__dirname, 'dist', '403.html'));
});

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));