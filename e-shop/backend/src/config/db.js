const mongoose = require('mongoose');

const STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

// Mongoose queues queries until the connection is ready, so the server doesn't need to wait for it
exports.connectDB = () => {
    if (!process.env.MONGODB_URI) {
        console.warn('MONGODB_URI is not set: users are kept in memory and will be lost when the server restarts')
        return
    }
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch((error) => console.error('MongoDB connection failed:', error.message))
}

exports.getDBStatus = () => ({
    storage: process.env.MONGODB_URI ? 'mongodb' : 'memory',
    database: STATES[mongoose.connection.readyState] || 'unknown',
})
