export const ROLE = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
  CUSTOMER: "customer",
} as const;

export const isNonCustomerRole = (role: Role): role is Exclude<Role, "customer"> => {
  return role !== ROLE.CUSTOMER;
};

export type Role = (typeof ROLE)[keyof typeof ROLE];
