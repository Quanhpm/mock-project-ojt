import type { Role } from "./role.model";

export type UserAccount = {
  id: number;
  role: Role;
  email?: string;
};
