"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const actor_schema_1 = __importDefault(require("../actor/actor.schema"));
const jwtHelper_1 = require("../helper/jwtHelper");
const error_1 = require("../middleware/error");
const createAuth = async (payload) => {
    const { password, identifier, role } = payload;
    const filter = {};
    const fields = ["email", "idNo", "phoneNumber"];
    if (!password.trim()) {
        throw new error_1.AppError(400, "Password is required");
    }
    if (!identifier.trim()) {
        throw new error_1.AppError(400, "Identifier is required");
    }
    if (!role.trim()) {
        throw new error_1.AppError(400, "Role is required");
    }
    const trimmedIdentifier = identifier.trim().toLowerCase();
    filter.$or = fields.map((field) => ({
        [field]: trimmedIdentifier,
    }));
    const existingUser = await actor_schema_1.default.findOne(filter)
        .select("+password _id email fullName")
        .lean(false);
    if (!existingUser) {
        throw new error_1.AppError(400, "You are not registered");
    }
    const isPasswordValid = await existingUser.comparePassword(password);
    if (!isPasswordValid) {
        throw new error_1.AppError(401, "Invalid credentials");
    }
    const data = {
        _id: existingUser._id,
        email: existingUser.email,
        role,
        fullName: existingUser.fullName,
    };
    const accessToken = await jwtHelper_1.jwtHelper.generateToken(data, process.env.ACCESS_TOKEN_SECRET_KEY, process.env.ACCESS_TOKEN_EXPIRE_IN);
    if (!accessToken) {
        throw new error_1.AppError(400, "Token not found");
    }
    const userResponse = existingUser.toObject();
    delete userResponse.password;
    return {
        user: userResponse,
        accessToken,
    };
};
const getAuths = async (payload) => {
    const { _id, email, fullName, role } = payload;
    if (!_id) {
        throw new error_1.AppError(401, "Unathorize");
    }
    const user = await actor_schema_1.default.findById(_id);
    return user;
};
const getAdminAuths = async (adminId) => {
    return;
};
const readAuth = async (authId) => {
    return;
};
exports.AuthService = {
    createAuth,
    getAuths,
    getAdminAuths,
    readAuth,
};
