require("dotenv").config();
const express = require('express');
const path = require('path');
const mongoose = require("mongoose");

const app = express();

const port = 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'register.html'));
});

app.get('/sidebar.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'dahboard.html'));
});

// API Routes
const authRoutes = require("./routes/authRoute");
app.use('/auth', authRoutes);

app.listen(port, () => { 
    console.log(`Server running at http://localhost:${port}`);
});