const {connectDB, getDBStatus} = require('../../../config/db');

// Quick deployment check: shows where users are stored and whether MongoDB is connected
exports.getHealth = async (req, res) => {
    try {
        await connectDB();
        res.json(getDBStatus());
    }
    catch (error) {
        res.status(503).json({...getDBStatus(), error: error.message});
    }
}
