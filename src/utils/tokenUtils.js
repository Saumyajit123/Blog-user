const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const generateSecretKey = () => {
    return crypto.randomBytes(64).toString("hex");
};

const generateAccessToken = (userId, role, secretKey) => {
    return jwt.sign(
        {
            userId,
            role,
            type: "access"
        },
        secretKey,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m"
        }
    );
};

const generateRefreshToken = (userId, role, secretKey) => {
    return jwt.sign(
        {
            userId,
            role,
            type: "refresh"
        },
        secretKey,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d"
        }
    );
};

module.exports = {
    generateSecretKey,
    generateAccessToken,
    generateRefreshToken
};