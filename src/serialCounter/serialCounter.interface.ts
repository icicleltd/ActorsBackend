import { Document } from "mongoose";

export interface ICounter extends Document {
  name: string;
  seq: number;
}
export interface ICounterPayload {
  name?: string;
  seq: number;
}
