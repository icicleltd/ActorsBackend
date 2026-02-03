export interface ProfileNewsAddPayload {
  title: string;
  link: string;
  image: string;
  details: string;
  published: string;
  category: string;
  idNo: string;
}
export interface ProfileNewsEditPayload extends ProfileNewsAddPayload {
  _id: string;
}

export type PickActorPayloadForNews = Pick<
  ProfileNewsAddPayload,
  "title" | "link" | "image" | "details" | "published" | "category" | "idNo"
>;
export type PickActorPayloadEditNews = Pick<
  ProfileNewsEditPayload,
  | "title"
  | "link"
  | "image"
  | "details"
  | "published"
  | "category"
  | "idNo"
  | "_id"
>;
