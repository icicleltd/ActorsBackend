export interface INews {
  title: string;
  image: string;
  published: Date;
  link: string;
  details: string;
  category: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateNewsDto {
  title: string;
  published: Date;
  link: string;
  details: string;
  category: string;
}

