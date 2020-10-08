const dotenv = require('dotenv');
// const http = require('http');

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

const app = require('./app');

dotenv.config({ path: './config.env' });

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
    console.log(`App running on port ${process.env.PORT}`);
});
// const server = http.createServer(app);

// server.listen(port, () => {
//     console.log(`App running on port ${process.env.PORT}`);
// });

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});