const express = require('express')
const path = require('path')
const requireDB = require('./middlewares/requireDB')
const userRoutes = require('./app/user/routes')
const healthRoutes = require('./app/health/routes')
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

app.use('/users', requireDB, userRoutes);
app.use('/health', healthRoutes);

// Frontend: serves everything inside login_page/frontend
const FRONTEND_DIR = path.join(__dirname, '..', '..', 'frontend');
app.use(express.static(FRONTEND_DIR));

app.listen(port, () => {console.log(`Server started on http://localhost:${port}`)})

module.exports = app
