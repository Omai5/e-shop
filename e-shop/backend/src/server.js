const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const userRoutes = require('./app/user/routes')
const app = express()
app.use(express.json());
const port = process.env.PORT || 8000

// CORS: lets the frontend call the API even when opened from another origin (Live Server, file://)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

app.use('/users', userRoutes);

// Frontend: serves everything inside login_page/frontend
const FRONTEND_DIR = path.join(__dirname, '..', '..', 'frontend');
app.use(express.static(FRONTEND_DIR));

// Mongoose queues queries until the connection is ready, so the server doesn't need to wait for it
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch((error) => console.error('MongoDB connection failed:', error.message))
} else {
    console.warn('MONGODB_URI is not set: users are kept in memory and will be lost when the server restarts')
}

app.listen(port, () => {console.log(`Server started on http://localhost:${port}`)})

module.exports = app
