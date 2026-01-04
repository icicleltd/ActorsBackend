"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizePayload = void 0;
const sanitizePayload = (payload) => {
    return Object.fromEntries(Object.entries(payload).filter(([_, value]) => value !== undefined &&
        value !== null &&
        !(typeof value === "string" && value.trim() === "")));
};
exports.sanitizePayload = sanitizePayload;
