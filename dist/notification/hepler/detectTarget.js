"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODEL_MAP = exports.getTarget = void 0;
const appointments_schema_1 = __importDefault(require("../../appointments/appointments.schema"));
const beAMember_schema_1 = __importDefault(require("../../beAMember/beAMember.schema"));
const contact_schema_1 = require("../../contact/contact.schema");
const payment_schema_1 = require("../../payment/payment.schema");
const mongoose_1 = require("mongoose");
const actor_payment_schema_1 = require("../../actor payment/actor.payment.schema");
const getTarget = ({ schedule, contact, payment, application, notifyPayment, }) => {
    if (schedule)
        return { key: "schedule", id: schedule };
    if (contact)
        return { key: "contact", id: contact };
    if (payment)
        return { key: "payment", id: payment };
    if (application)
        return { key: "application", id: application };
    if (notifyPayment)
        return { key: "notifyPayment", id: notifyPayment };
    return null;
};
exports.getTarget = getTarget;
exports.MODEL_MAP = {
    schedule: {
        model: appointments_schema_1.default,
        defaultUpdate: { isView: true },
    },
    contact: {
        model: contact_schema_1.ContactUs,
        defaultUpdate: { isView: true },
    },
    payment: {
        model: payment_schema_1.Payment,
        defaultUpdate: { isView: true },
    },
    notifyPayment: {
        model: actor_payment_schema_1.NotifyPayment,
        defaultUpdate: { isView: true },
    },
    application: {
        model: beAMember_schema_1.default,
        resolveUpdate: ({ type, role, recipient }) => {
            // Admin reading BE_A_MEMBER
            if (type === "BE_A_MEMBER" && role !== "member") {
                return {
                    update: { isAdminRead: true },
                };
            }
            // Member reading REFERENCE_REQUEST
            if (type === "REFERENCE_REQUEST" && role === "member") {
                return {
                    update: {
                        "actorReference.$[elem].isMemberRead": true,
                    },
                    arrayFilters: [
                        { "elem.actorId": new mongoose_1.Types.ObjectId(recipient) },
                    ],
                };
            }
            // Member reading BE_A_MEMBER
            if (type === "BE_A_MEMBER" && role === "member") {
                return {
                    update: { isMemberRead: true },
                };
            }
            return null;
        },
    },
};
