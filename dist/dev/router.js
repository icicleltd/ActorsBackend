"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const actor_schema_1 = __importDefault(require("../actor/actor.schema"));
const router = express_1.default.Router();
// router.post("/upcomming", EventController.createEvent);
router.get("/migrate", async (req, res) => {
    const { text } = req.body;
    try {
        if (text !== "mg") {
            return res.send("no idNo");
        }
        const actors = await actor_schema_1.default.find({
            rank: { $exists: true, $ne: null },
            rankYearRange: { $exists: true },
            rankHistory: { $exists: false },
        });
        // console.log(actors);
        for (const actor of actors) {
            const { rank, rankYearRange } = actor;
            console.log(rank, rankYearRange);
            //   if (!rank || !rankYearRange) continue;
            actor.rankHistory = [
                {
                    rank: rank,
                    yearRange: rankYearRange.yearRange,
                    start: rankYearRange.start,
                    end: rankYearRange.end,
                },
            ];
            console.log(actor);
            //  return res.send(actor)
            //   console.log(actor);
            await actor.save();
        }
        console.log(`Found ${actors.length} actors to migrate`);
        let updatedCount = 0;
        return res.json({
            success: true,
            message: "Migration completed",
            updated: actors,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});
exports.default = router;
