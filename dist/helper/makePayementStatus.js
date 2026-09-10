"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertStatus = void 0;
const convertStatus = (status) => {
    console.log(status);
    switch (status) {
        case "pending":
            return "Need Verified";
        case "verified":
            return "Paid";
        case "request":
            return "Unpaid";
        default:
            return "Unpaid";
    }
};
exports.convertStatus = convertStatus;
