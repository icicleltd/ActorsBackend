import { ClientSession, Types } from "mongoose";
import Actor from "../actor/actor.schema";

export async function syncActorJoinYear(
  actorId: string,
  candidateYear: number,
  session?: ClientSession,
) {
  await Actor.updateOne(
    {
      _id: new Types.ObjectId(actorId.toString()),
      $or: [{ joinYear: null }, { joinYear: { $gt: candidateYear } }],
    },
    { $set: { joinYear: candidateYear } },
    { session },
  );
}
export async function syncActorJoinYearBulk(
  actorIds: string[],
  candidateYear: number,
  session?: ClientSession,
) {
  console.log(actorIds, candidateYear);
  await Actor.updateMany(
    {
      _id: { $in: actorIds },
      $or: [{ joinYear: null }, { joinYear: { $gt: candidateYear } }],
    },
    { $set: { joinYear: candidateYear } },
    { session },
  );
}
