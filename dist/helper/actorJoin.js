"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncActorJoinYear = syncActorJoinYear;
exports.syncActorJoinYearBulk = syncActorJoinYearBulk;
const mongoose_1 = require("mongoose");
const actor_schema_1 = __importDefault(require("../actor/actor.schema"));
async function syncActorJoinYear(actorId, candidateYear, session) {
    await actor_schema_1.default.updateOne({
        _id: new mongoose_1.Types.ObjectId(actorId.toString()),
        $or: [{ joinYear: null }, { joinYear: { $gt: candidateYear } }],
    }, { $set: { joinYear: candidateYear } }, { session });
}
async function syncActorJoinYearBulk(actorIds, candidateYear, session) {
    console.log(actorIds, candidateYear);
    await actor_schema_1.default.updateMany({
        _id: { $in: actorIds },
        $or: [{ joinYear: null }, { joinYear: { $gt: candidateYear } }],
    }, { $set: { joinYear: candidateYear } }, { session });
}
