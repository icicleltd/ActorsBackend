"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const actor_schema_1 = __importDefault(require("../actor/actor.schema"));
const jwtHelper_1 = require("../helper/jwtHelper");
const error_1 = require("../middleware/error");
const admin_schema_1 = require("../admin/admin.schema");
const requiredName_1 = require("../hepler/requiredName");
const otp_schema_1 = require("./otp.schema");
const sentOTP_1 = require("../helper/mailTempate/sentOTP");
const emailHelper_1 = require("../helper/emailHelper");
const createAuth = async (payload, otp) => {
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
        // [field]: trimmedIdentifier,
        [field]: { $regex: trimmedIdentifier, $options: "i" },
    }));
    filter.isActive = true;
    const existingUser = await actor_schema_1.default.findOne(filter)
        .select("+password _id email fullName")
        .lean(false);
    if (!existingUser) {
        throw new error_1.AppError(401, "Unauthorized");
    }
    let isMatchingOTP = null;
    let isPasswordValid = null;
    if (otp) {
        console.log(existingUser);
        isMatchingOTP = await otp_schema_1.ActorOTP.findOne({
            actor: existingUser._id,
            otp,
        }).lean();
        if (otp && !isMatchingOTP) {
            throw new error_1.AppError(401, "Invalid OTP");
        }
    }
    else {
        isPasswordValid = await existingUser.comparePassword(password);
        if (!isPasswordValid) {
            throw new error_1.AppError(401, "Invalid Password");
        }
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
    const { _id, email, fullName, role } = payload.data;
    if (!_id) {
        throw new error_1.AppError(401, "Unathorize");
    }
    const [user, admin] = await Promise.all([
        actor_schema_1.default.findById(_id),
        admin_schema_1.Admin.findById(_id),
    ]);
    if (!user && !admin) {
        throw new error_1.AppError(404, "Not found");
    }
    let accessToken = payload.accessToken;
    if (user && user?.role !== role) {
        const data = {
            _id: user._id,
            email: user.email,
            role: user?.role,
            fullName: user.fullName,
        };
        accessToken = await jwtHelper_1.jwtHelper.generateToken(data, process.env.ACCESS_TOKEN_SECRET_KEY, process.env.ACCESS_TOKEN_EXPIRE_IN);
        if (!accessToken) {
            throw new error_1.AppError(400, "Token not found");
        }
    }
    return { user, admin, accessToken };
};
const getAdminAuths = async (adminId) => {
    return;
};
const readAuth = async (authId) => {
    return;
};
const createOTP = async (idNo, email) => {
    (0, requiredName_1.requiredString)(idNo, "Actor ID");
    (0, requiredName_1.requiredString)(email, "Email");
    const existsActor = await actor_schema_1.default.findOne({
        idNo: { $regex: `^${idNo.trim()}$`, $options: "i" },
    })
        .select("_id fullName")
        .lean();
    if (!existsActor) {
        throw new error_1.AppError(404, "Actor not found");
    }
    const existsOTP = await otp_schema_1.ActorOTP.findOne({ actor: existsActor._id }).lean();
    if (existsOTP) {
        throw new error_1.AppError(409, "OTP already exists for this actor.Check your email");
    }
    // if (existsOTP) {
    //   await ActorOTP.findByIdAndDelete(existsActor._id);
    // }
    const generateOpt = Math.floor(100000 + Math.random() * 900000).toString();
    const saveOTP = await otp_schema_1.ActorOTP.create({
        actor: existsActor._id,
        otp: generateOpt,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });
    if (!saveOTP) {
        throw new error_1.AppError(500, "Failed to create OTP. Please try again.");
    }
    const { subject, text, html } = (0, sentOTP_1.otpEmailTemplate)(existsActor.fullName, generateOpt, saveOTP.expiresAt);
    await (0, emailHelper_1.sendMail)({ to: email, subject, text, html });
    // console.log(saveOTP)
    // console.log(existsOTP);
    // console.log(existsActor);
    return saveOTP;
};
const updatePassword = async (idNo, newPassword) => {
    (0, requiredName_1.requiredString)(idNo, "Actor ID");
    (0, requiredName_1.requiredString)(newPassword, "New Password");
    const existingUser = await actor_schema_1.default.findOne({
        idNo: { $regex: `^${idNo.trim()}$`, $options: "i" },
    }).select("+password _id email fullName").lean(false);
    if (!existingUser) {
        throw new error_1.AppError(404, "Actor not found");
    }
    existingUser.password = newPassword;
    await existingUser.save();
    return;
};
exports.AuthService = {
    createAuth,
    getAuths,
    getAdminAuths,
    readAuth,
    createOTP,
    updatePassword,
};
