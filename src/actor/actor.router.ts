import express from "express";
import { ActorController } from "./actor.controller";
import { fileUploader } from "../helper/fileUpload";
const actorRouter = express.Router();
actorRouter.post(
  "/",
  fileUploader.upload.fields([
    // { name: "characterPhoto", maxCount: 10 }, // array
    { name: "frontPhoto", maxCount: 1 }, // single
    { name: "leftPhoto", maxCount: 1 }, // single
    { name: "rightPhoto", maxCount: 1 }, // single
  ]),
  ActorController.createActor
);
actorRouter.get('/',ActorController.getAllActor);
actorRouter.get('/:id',ActorController.getSingleActor)
actorRouter.get('/rank/:rank',ActorController.filterByRank)
export default actorRouter;
