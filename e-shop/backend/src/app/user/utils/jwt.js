const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.ACCESS_SECRET || 'DSJKFHDSKJHFSDKJHFJSDKHFJDSK'
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'DSFKDHSFKJSDHFJKDFJKHDSJKHD'

exports.createAccessToken = (user) => {
    return jwt.sign({email: user.email}, ACCESS_SECRET, {expiresIn: '1h'})
}

exports.createRefreshToken = (user) => {
    return jwt.sign({email: user.email}, REFRESH_SECRET, {expiresIn: '12h'})
}

exports.verifyRefreshToken = (token) => {
    return jwt.verify(token, REFRESH_SECRET);
}

exports.verifyAccessToken = (token) => {
    return jwt.verify(token, ACCESS_SECRET);
}