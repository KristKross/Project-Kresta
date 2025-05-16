const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'login.html'));
});

app.listen(port, () => { 
    console.log(`Server running at http://localhost:${port}`);
});