const userRepo = require('../repositories/user.repository');
const {hashPassword, comparePassword} = require('../utils/hash');
const {createAccessToken, createRefreshToken, verifyRefreshToken, verifyAccessToken} = require('../utils/jwt');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email) => typeof email === 'string' ? email.trim().toLowerCase() : '';

// 1. register user
exports.register = async (email, password) => {
    email = normalizeEmail(email);
    if (!EMAIL_REGEX.test(email)) throw new Error('Please enter a valid email');
    if (typeof password !== 'string' || password.length < 6) throw new Error('Password must be at least 6 characters');

    const exists = userRepo.findByEmail(email);
    if (exists) throw new Error('User already exists');

    const hashedPassword = await hashPassword(password);
    return userRepo.create(email, hashedPassword);
}

// 2. login user
exports.login = async (email, password) => {
    const user = userRepo.findByEmail(normalizeEmail(email));
    if (!user || typeof password !== 'string') throw new Error('Invalid Credentials');

    const isCorrectPassword = await comparePassword(password, user.password);
    if (!isCorrectPassword) throw new Error('Invalid Credentials');

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    return {accessToken, refreshToken};
}

// 3. get current user
exports.getMe = (token) => {
    const {email} = verifyAccessToken(token);
    return {email};
}

// 4. refresh access token
exports.refresh = (token) => {
    const user = verifyRefreshToken(token);
    const newAccessToken = createAccessToken(user);
    return {newAccessToken};
}
