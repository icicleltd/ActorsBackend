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
  link: string;
  details: string;
  published: string;
  category: string;
  image: string;
}

