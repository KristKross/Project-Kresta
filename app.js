require("dotenv").config();
const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const cors = require("cors");
const sessionMiddleware = require("./config/session");
const isAuthenticated = require("./middleware/sessionAuth");
const checkPremiumTier = require("./middleware/checkPremiumTier");

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

// List of protected HTML files
const protectedHtml = ['/tasks.html', '/planner.html', '/analytics.html', 'dashboard.html'];

app.use((req, res, next) => {
    if (!req.session.userData?.user && protectedHtml.includes(req.path)) {
        return res.redirect('/login');
    }
    next();
});

const Workspace = require("./models/Workspace");
app.get("/create-workspace", async (req, res) => {
    try {
        const workspace = new Workspace({
            name: "Test Workspace",
            owner: req.session.userData?.user._id,
            members: [req.session.userData?.user._id],
        });
        const doc = await workspace.save();
        return res.send(doc);
    } catch (err) {
        if (err.name === "MongooseError" && err.message === "Model.prototype.save() no longer accepts a callback") {
            throw new Error("Model.prototype.save() no longer accepts a callback");
        }
        console.log(err);
        return res.status(500).send(err);
    }
});
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

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    if (!req.session.userData?.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'dist', 'dashboard.html'));
});

app.get('/tasks', checkPremiumTier, (req, res) => {
    if (!req.session.userData?.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'dist', 'tasks.html'));
});

app.get('/planner', (req, res) => {
    if (!req.session.userData?.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'dist', 'planner.html'));
});

app.get('/analytics', (req, res) => {
    if (!req.session.userData?.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'dist', 'analytics.html'));
});

app.get('/pricing', (req, res) => {
    if (!req.session.userData?.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'dist', 'pricing.html'));
});

app.get('/profile', (req, res) => {
    if (!req.session.userData?.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'dist', 'profile.html'));
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
app.use('/api/workspace', checkPremiumTier, isAuthenticated, workspaceRoutes);

const taskRoutes = require("./routes/taskRoute");
app.use('/api/task', checkPremiumTier, isAuthenticated, taskRoutes);

const uploadRoutes = require("./routes/uploadRoute");
app.use('/api', uploadRoutes);

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));