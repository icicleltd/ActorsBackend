export type ContactStatus = "new" | "read" | "replied" | "archived";

export interface ContactAttrs {
  name?: string;
  email: string;
  phone?: string;
  message: string;
  status?: ContactStatus;
}

export interface ContactDoc {
  name?: string;
  email: string;
  phone?: string;
  message: string;
  status: ContactStatus;
  createdAt?: Date;
  updatedAt?: Date;
}