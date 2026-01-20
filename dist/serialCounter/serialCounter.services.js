"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerialCounterService = void 0;
const error_1 = require("../middleware/error");
const serialCounter_schema_1 = require("./serialCounter.schema");
/* ------------------------------------
   GET NEXT SERIAL (AUTO CREATE)
------------------------------------- */
const getNextSerial = async (payload) => {
    if (!payload?.name) {
        throw new error_1.AppError(400, "Counter name is required");
    }
    const counter = await serialCounter_schema_1.Counter.findOneAndUpdate({ name: payload.name }, {
        $inc: { seq: 1 },
    }, {
        new: true,
        upsert: true,
    });
    if (!counter) {
        throw new error_1.AppError(400, "Failed to generate serial");
    }
    return counter;
};
/* ------------------------------------
   GET CURRENT SERIAL (NO INCREMENT)
------------------------------------- */
const getCurrentSerial = async (name) => {
    if (!name) {
        throw new error_1.AppError(400, "Counter name is required");
    }
    const counter = await serialCounter_schema_1.Counter.findOne({ name });
    return counter;
};
/* ------------------------------------
   EXPORT SERVICE
------------------------------------- */
exports.SerialCounterService = {
    getNextSerial,
    getCurrentSerial,
};
