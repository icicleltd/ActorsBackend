export interface IBanner {
  title: string;
  description?: string;
  imageUrl: string;
  publicId?: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}
