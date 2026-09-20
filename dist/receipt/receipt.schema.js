"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Receipt = void 0;
// receipt.model.ts
const mongoose_1 = require("mongoose");
const receiptSchema = new mongoose_1.Schema({
    receiptNo: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    actorId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Actor" },
    name: { type: String, required: true },
    idNo: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    amountInWord: { type: String, required: true },
    allYear: { type: [Number], required: true },
    verifiedAt: { type: Date, default: undefined },
    verifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: undefined },
}, { timestamps: true });
receiptSchema.index({ actorId: 1, createdAt: -1 });
exports.Receipt = (0, mongoose_1.model)("Receipt", receiptSchema);
