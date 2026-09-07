"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.makeUser = void 0;
const jwtHelper_1 = require("../helper/jwtHelper");
const error_1 = require("../middleware/error");
const user_interface_1 = require("./user.interface");
const user_schema_1 = require("./user.schema");
const makeUser = async (payload) => {
    const { email, password, role } = payload;
    if (!email)
        throw new error_1.AppError(400, "Email is required");
    if (!password)
        throw new error_1.AppError(400, "Password is required");
    if (!user_interface_1.USER_ROLES.includes(role))
        throw new error_1.AppError(400, "Role not match in User Role");
    const existing = await user_schema_1.User.findOne({ email }).lean();
    if (existing)
        throw new error_1.AppError(400, "This user already exist");
    const newUser = await user_schema_1.User.create({
        email,
        password,
        role,
    });
    newUser.password = undefined;
    if (!newUser)
        throw new error_1.AppError(500, "Failed to created User");
    return newUser;
};
exports.makeUser = makeUser;
const login = async (payload) => {
    const { identifier, password } = payload;
    if (!identifier)
        throw new error_1.AppError(400, "Identifier is required");
    if (!password)
        throw new error_1.AppError(400, "Password is required");
    const existingUser = await user_schema_1.User.findOne({ email: identifier.trim(), isActive: true }).select("email password role");
    if (!existingUser) {
        throw new error_1.AppError(401, "Unauthorized");
    }
    const matchPassword = await existingUser?.comparePassword(password);
    if (!matchPassword)
        throw new error_1.AppError(400, "Incorrect Password!");
    const data = {
        _id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
        fullName: "unknown",
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
exports.login = login;
