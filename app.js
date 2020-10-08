const express = require('express');
// const helmet = require('helmet');
// const xss = require('xss-clean');
const cors = require('cors');

const app = express();

const ussdRoute = require('./routes/ussd');

// GLOBAL MIDDLEWARES

// Set securrity http headers
// app.use(helmet());
app.use(cors());

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Data sanitization agains xss
// app.use(xss());

const welcomeRoute = (req, res, next) => {
    res.send('Welcome');
    next();
};

app.get('/', welcomeRoute);
app.get('/api/v1/', welcomeRoute);

app.use('/api/v1/ussd', ussdRoute);

app.all('*', (req, res, next) => {
    res.send(`Can't find ${req.originalUrl} on this server!`, 404);
});

module.exports = app;
