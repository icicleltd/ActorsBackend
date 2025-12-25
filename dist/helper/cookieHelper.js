"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setCookie = (res, fieldName, token, exprie) => {
    res.cookie(`${fieldName}`, token, {
        secure: false,
        httpOnly: true,
        expires: new Date(Date.now() + exprie)
    });
};
exports.default = setCookie;
