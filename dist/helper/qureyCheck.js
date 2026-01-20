"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEnumValue = void 0;
const isValidEnumValue = (value, allowedValues) => {
    return typeof value === "string" && allowedValues.includes(value);
};
exports.isValidEnumValue = isValidEnumValue;
