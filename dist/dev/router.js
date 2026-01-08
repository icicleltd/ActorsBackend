"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const actor_schema_1 = __importDefault(require("../actor/actor.schema"));
const router = express_1.default.Router();
// router.post("/upcomming", EventController.createEvent);
// router.get("/migrate", async (req, res) => {
//   const { text } = req.body;
//   try {
//     if (text !== "mg") {
//       return res.send("no idNo");
//     }
//     const actors = await Actor.find({
//       rank: { $exists: true, $ne: null },
//       rankYearRange: { $exists: true },
//       rankHistory: { $exists: false },
//     });
//     // console.log(actors);
//     for (const actor of actors) {
//       const { rank, rankYearRange } = actor as any;
//       console.log(rank, rankYearRange);
//       //   if (!rank || !rankYearRange) continue;
//       actor.rankHistory = [
//         {
//           rank: rank,
//           yearRange: rankYearRange.yearRange,
//           start: rankYearRange.start,
//           end: rankYearRange.end,
//         },
//       ];
//       console.log(actor);
//       //  return res.send(actor)
//       //   console.log(actor);
//       await actor.save();
//     }
//     console.log(`Found ${actors.length} actors to migrate`);
//     let updatedCount = 0;
//     return res.json({
//       success: true,
//       message: "Migration completed",
//       updated: actors,
//     });
//   } catch (err: any) {
//     return res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// });
// router.post("/updateIdNo", async (req, res) => {
//   const actors = await Actor.find({
//     idNo: { $not: /-/ }, // only old ones
//   });
//   for (const actor of actors) {
//     const oldIdNo = actor.idNo;
//     const newIDNo = `${actor.category}-${actor.idNo}`;
//     console.log("Updating:", {
//       name: actor.fullName,
//       oldIdNo,
//       newIDNo,
//     });
//     actor.idNo = newIDNo;
//     console.log(actor);
//     await actor.save();
//   }
//   // return res.send({ actor: actor });
//   res.send({ length: actors.length, actor: actors });
// });
router.post("/pull-duplicate-rank/:id", async (req, res) => {
    const actorId = req.params.id;
    const rankId = req.body.rankId;
    const result = await actor_schema_1.default.findByIdAndUpdate(actorId, {
        $pull: {
            rankHistory: {
                _id: rankId,
            },
        },
    }, {
        new: true,
    });
    console.log(result);
    res.send(result);
});
exports.default = router;
