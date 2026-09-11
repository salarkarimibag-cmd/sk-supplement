// TODO: turn this into a Mongoose schema once `lib/db.ts` connects to MongoDB.
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
}
