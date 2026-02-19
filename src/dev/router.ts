import express from "express";
import Actor from "../actor/actor.schema";
import { sendMail } from "../helper/emailHelper";
import { AppError } from "../middleware/error";
import BeAMember from "../beAMember/beAMember.schema";
import ActorPayment from "../actor payment/actor.payment.schema";

const router = express.Router();

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
//
//     for (const actor of actors) {
//       const { rank, rankYearRange } = actor as any;
//

//       //   if (!rank || !rankYearRange) continue;

//       actor.rankHistory = [
//         {
//           rank: rank,
//           yearRange: rankYearRange.yearRange,
//           start: rankYearRange.start,
//           end: rankYearRange.end,
//         },
//       ];
//
//       //  return res.send(actor)
//       //
//       await actor.save();
//     }
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

//     actor.idNo = newIDNo;
//
//     await actor.save();
//   }
//   // return res.send({ actor: actor });
//   res.send({ length: actors.length, actor: actors });
// });

router.post("/pull-duplicate-rank/:id", async (req, res) => {
  const actorId = req.params.id;
  const rankId = req.body.rankId;

  const result = await Actor.findByIdAndUpdate(
    actorId,
    {
      $pull: {
        rankHistory: {
          _id: rankId,
        },
      },
    },
    {
      new: true,
    },
  );
  res.send(result);
});
router.post("/fix-actor", async (req, res) => {
  const result = await Actor.updateMany(
    { isModified: { $exists: false } },
    { $set: { isModified: false } },
  );

  res.json(result);
});

router.post("/be-a-mem", async (req, res) => {
  const result = await BeAMember.updateMany(
    { "actorReference.status": { $exists: false } },
    {
      $set: {
        "actorReference.$[elem].status": "pending",
      },
    },
    {
      arrayFilters: [{ "elem.status": { $exists: false } }],
    },
  );

  res.json({
    success: true,
    modifiedCount: result.modifiedCount,
  });
});

router.post("/fix-roles", async (req, res) => {
  const result = await BeAMember.updateMany(
    { role: { $exists: false } },
    { $set: { role: "member" } },
  );

  res.json(result);
});
// test mail

router.post("/test-mail", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new AppError(400, "Email required");
  }
  await sendMail({
    to: email,
    subject: "Actors Equity – Application Submitted Successfully",
    html: `
    <div style="font-family: Arial, sans-serif; background:#f6f8fb; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; padding:24px;">
        
        <h2 style="color:#0f172a; margin-bottom:8px;">
          Application Submitted Successfully 🎉
        </h2>

        <p style="color:#334155; font-size:15px;">
          Dear Applicant,
        </p>

        <p style="color:#334155; font-size:15px;">
          Thank you for submitting your <strong>Actors Equity membership application</strong>.
          We have successfully received your form.
        </p>

        <div style="margin:16px 0; padding:12px; background:#f1f5f9; border-left:4px solid #0ea5e9;">
          <p style="margin:0; color:#0f172a;">
            <strong>Current Status:</strong> <span style="color:#f59e0b;">Pending Review</span>
          </p>
        </div>

  

        <hr style="margin:24px 0; border:none; border-top:1px solid #e5e7eb;" />

        <p style="font-size:13px; color:#64748b;">
          Regards,<br />
          <strong>Actors Equity Team</strong>
        </p>
      </div>
    </div>
  `,
  });

  res.send({ success: true });
});

router.get("/agg", async (req, res) => {
  // const result = await Actor.aggregate([
  //   {
  //     $match: { isActive: true },
  //   },
  //   {
  //     $group: {
  //       _id: "$status",
  //       total: { $sum: 1 },
  //     },
  //   },
  // ]);
  // console.log(result);

  // Top 5 newest actors
  const result = await Actor.aggregate([
    { $sort: { createdAt: -1 } },
    { $limit: 5 },
    {
      $project: {
        fullName: 1,
        createdAt: 1,
        _id: 0,
      },
    },
  ]);
  console.log(result);
  res.send({ data: result });
});
// add dummy data for payment

router.post("/seed-payment", async (req, res) => {
  const dummyPayments = [
    {
      actor: "697f17b95e8fdf3310015ff7",
      type: "membership",
      year: 2024,
      amount: 2000,
      method: "bkash",
      transactionId: "TXN-MEM-2024-001",
      status: "verified",
    },
    {
      actor: "697f17b95e8fdf3310015ff7",
      type: "membership",
      year: 2025,
      amount: 2000,
      method: "bkash",
      transactionId: "TXN-MEM-2025-001",
      status: "verified",
    },
    {
      actor: "697f17b95e8fdf3310015ff7",
      type: "membership",
      year: 2026,
      amount: 2000,
      method: "bkash",
      transactionId: "TXN-MEM-2026-001",
      status: "pending",
    },
  ];
  try {
    const result = await ActorPayment.insertMany(dummyPayments);
    res.status(201).json({
      success: true,
      inserted: result.length,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
