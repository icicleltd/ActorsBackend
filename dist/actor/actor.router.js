"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const actor_controller_1 = require("./actor.controller");
const fileUpload_1 = require("../helper/fileUpload");
const actorRouter = express_1.default.Router();
actorRouter.post("/", fileUpload_1.fileUploader.upload.fields([
    // { name: "characterPhoto", maxCount: 10 }, // array
    { name: "frontPhoto", maxCount: 1 }, // single
    { name: "leftPhoto", maxCount: 1 }, // single
    { name: "rightPhoto", maxCount: 1 }, // single
]), actor_controller_1.ActorController.createActor);
actorRouter.put("/:id", fileUpload_1.fileUploader.upload.fields([
    { name: "coverImages", maxCount: 10 }, // Multiple cover images
    { name: "photo", maxCount: 1 }, // Single profile photo
]), actor_controller_1.ActorController.updateActor);
actorRouter.get('/', actor_controller_1.ActorController.getAllActor);
actorRouter.get('/:id', actor_controller_1.ActorController.getSingleActor);
actorRouter.get('/rank/:rank', actor_controller_1.ActorController.filterByRank);
exports.default = actorRouter;
