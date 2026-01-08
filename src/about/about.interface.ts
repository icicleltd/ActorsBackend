export interface IPoint {
  _id: string;
  text: string;
}

export interface IAbout {
  title: string;
  description: string;
  points: IPoint[];
  images: {
    year: string;
    image: string;
    publicId?: string;
    _id?: string;
  }[];
}


export interface AboutPayload {
  title: string;
  description: string;
  points: string[];
  year: string;
}

export type AllowedAboutUpdatePayload = Pick<IAbout, "title">;
