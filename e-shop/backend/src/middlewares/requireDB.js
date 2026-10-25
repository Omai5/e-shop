const {connectDB} = require('../config/db');

// Makes sure MongoDB is connected before the request reaches the controllers
module.exports = async (req, res, next) => {
    try {
        await connectDB();
        next();
    }
    catch (error) {
        res.status(503).json({message: `Database connection failed: ${error.message}`});
    }
}
