"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyLogin = void 0;
const jwtHelper_1 = require("../helper/jwtHelper");
const VerifyLogin = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({
            message: "No token provided",
        });
    }
    const accessToken = authHeader.split(" ")[1];
    const data = jwtHelper_1.jwtHelper.verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
    const value = {
        data, accessToken
    };
    req.user = value;
    next();
};
exports.VerifyLogin = VerifyLogin;
