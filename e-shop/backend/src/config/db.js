const mongoose = require('mongoose');

const STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

// Reused across requests; reset on failure so the next request retries (Vercel reuses warm instances)
let connection = null;

exports.connectDB = () => {
    if (!process.env.MONGODB_URI) return Promise.resolve()
    if (!connection) {
        connection = mongoose.connect(process.env.MONGODB_URI, {serverSelectionTimeoutMS: 5000})
            .then(() => console.log('Connected to MongoDB'))
            .catch((error) => {
                connection = null
                console.error('MongoDB connection failed:', error.message)
                throw error
            })
    }
    return connection
}

exports.getDBStatus = () => ({
    storage: process.env.MONGODB_URI ? 'mongodb' : 'memory',
    database: STATES[mongoose.connection.readyState] || 'unknown',
})
