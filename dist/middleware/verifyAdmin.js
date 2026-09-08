"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyAdmin = void 0;
const actor_schema_1 = __importDefault(require("../actor/actor.schema"));
const error_1 = require("./error");
const user_schema_1 = require("../user/user.schema");
const VerifyAdmin = async (req, res, next) => {
    const user = req.user;
    const { _id } = user.data;
    const actor = await actor_schema_1.default.findOne({ _id, role: { $in: ["admin"] } });
    const admin = await user_schema_1.User.findOne({
        _id,
        role: { $in: ["admin", "superadmin", "moderator", "account"] },
        isActive: true,
    });
    if (!actor && !admin) {
        throw new error_1.AppError(401, "Unauthorized");
    }
    next();
};
exports.VerifyAdmin = VerifyAdmin;
