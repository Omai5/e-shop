const {getDBStatus} = require('../../../config/db');

// Quick deployment check: shows where users are stored and whether MongoDB is connected
exports.getHealth = (req, res) => {
    res.json(getDBStatus());
}
