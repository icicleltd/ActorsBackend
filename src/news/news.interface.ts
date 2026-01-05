export interface INews {
  title: string;
  image: string;
  published: Date;
  link?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateNewsDto {
  title: string;
  published: Date;
  link: string;
}
