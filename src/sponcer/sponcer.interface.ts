export interface ISponcer {
  url: string;
  name: string;
  discount: string;
  terms: string;
  description: string;
  validity: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AllowEditSponsorField = Pick<
  ISponcer,
  "url" | "name" | "discount" | "terms" | "description" | "validity"
>;
