const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist'));
});

app.listen(port, () => { 
    console.log(`Server running at http://localhost:${port}`);
});
