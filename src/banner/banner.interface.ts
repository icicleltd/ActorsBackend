export interface IBanner {
  title: string;
  subtitle?: string;
  imageUrl: string;
  publicId: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}
