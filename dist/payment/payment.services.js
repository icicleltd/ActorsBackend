"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeAMemberService = void 0;
const actor_schema_1 = __importDefault(require("../actor/actor.schema"));
const error_1 = require("../middleware/error");
/* ------------------------------------
   CREATE BE A MEMBER
------------------------------------- */
const createBeAMember = async (payload) => {
    const { url } = payload;
    if (!url) {
        throw new error_1.AppError(400, "URL is required");
    }
    const result = await actor_schema_1.default.create({});
    if (!result) {
        throw new error_1.AppError(400, "Be a Member entry not created");
    }
    return result;
};
/* ------------------------------------
   GET ALL BE A MEMBERS
------------------------------------- */
const getBeAMembers = async () => {
    const members = await actor_schema_1.default.find().sort({ createdAt: -1 });
    return members;
};
/* ------------------------------------
   DELETE SINGLE BE A MEMBER
------------------------------------- */
const deleteBeAMember = async (id) => {
    if (!id) {
        throw new error_1.AppError(400, "Be a Member ID is required");
    }
    const member = await actor_schema_1.default.findById(id);
    if (!member) {
        throw new error_1.AppError(404, "Be a Member entry not found");
    }
    // If you later store publicId, uncomment this
    // await deleteFromCloudinary(member.publicId);
    await actor_schema_1.default.findByIdAndDelete(id);
    return member;
};
/* ------------------------------------
   EXPORT SERVICE
------------------------------------- */
exports.BeAMemberService = {
    createBeAMember,
    getBeAMembers,
    deleteBeAMember,
};
