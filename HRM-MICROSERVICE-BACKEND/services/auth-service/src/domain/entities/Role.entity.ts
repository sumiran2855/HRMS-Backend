import { Document } from "mongoose";

export interface IRole {
  _id?: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoleInput {
  name: string;
  description: string;
  permissions: string[];
  organizationId: string;
}

export enum RoleEnum {
  ADMIN = "admin",
  HR = "hr",
  MANAGER = "manager",
  EMPLOYEE = "employee",
  SUPERADMIN = "superadmin",
}

export enum PermissionEnum {
  CREATE_EMPLOYEE = "create:employee",
  READ_EMPLOYEE = "read:employee",
  UPDATE_EMPLOYEE = "update:employee",
  DELETE_EMPLOYEE = "delete:employee",
  CREATE_ATTENDANCE = "create:attendance",
  READ_ATTENDANCE = "read:attendance",
  UPDATE_ATTENDANCE = "update:attendance",
  DELETE_ATTENDANCE = "delete:attendance",
  APPROVE_ATTENDANCE = "approve:attendance",
  CREATE_USER = "create:user",
  READ_USER = "read:user",
  UPDATE_USER = "update:user",
  DELETE_USER = "delete:user",
  MANAGE_ROLES = "manage:roles",
  VIEW_REPORTS = "view:reports",
  EXPORT_DATA = "export:data",
}

export const DEFAULT_ROLES = {
  [RoleEnum.SUPERADMIN]: {
    name: RoleEnum.SUPERADMIN,
    description: "Super Administrator with full system access",
    permissions: Object.values(PermissionEnum),
  },
  [RoleEnum.ADMIN]: {
    name: RoleEnum.ADMIN,
    description: "Administrator with full organizational access",
    permissions: [
      PermissionEnum.CREATE_EMPLOYEE,
      PermissionEnum.READ_EMPLOYEE,
      PermissionEnum.UPDATE_EMPLOYEE,
      PermissionEnum.DELETE_EMPLOYEE,
      PermissionEnum.CREATE_ATTENDANCE,
      PermissionEnum.READ_ATTENDANCE,
      PermissionEnum.UPDATE_ATTENDANCE,
      PermissionEnum.APPROVE_ATTENDANCE,
      PermissionEnum.CREATE_USER,
      PermissionEnum.READ_USER,
      PermissionEnum.UPDATE_USER,
      PermissionEnum.DELETE_USER,
      PermissionEnum.MANAGE_ROLES,
      PermissionEnum.VIEW_REPORTS,
      PermissionEnum.EXPORT_DATA,
    ],
  },
  [RoleEnum.HR]: {
    name: RoleEnum.HR,
    description: "HR Personnel with employee and attendance management",
    permissions: [
      PermissionEnum.CREATE_EMPLOYEE,
      PermissionEnum.READ_EMPLOYEE,
      PermissionEnum.UPDATE_EMPLOYEE,
      PermissionEnum.CREATE_ATTENDANCE,
      PermissionEnum.READ_ATTENDANCE,
      PermissionEnum.UPDATE_ATTENDANCE,
      PermissionEnum.APPROVE_ATTENDANCE,
      PermissionEnum.VIEW_REPORTS,
      PermissionEnum.EXPORT_DATA,
    ],
  },
  [RoleEnum.MANAGER]: {
    name: RoleEnum.MANAGER,
    description: "Manager with team oversight access",
    permissions: [
      PermissionEnum.READ_EMPLOYEE,
      PermissionEnum.READ_ATTENDANCE,
      PermissionEnum.UPDATE_ATTENDANCE,
      PermissionEnum.VIEW_REPORTS,
    ],
  },
  [RoleEnum.EMPLOYEE]: {
    name: RoleEnum.EMPLOYEE,
    description: "Regular Employee with limited access",
    permissions: [
      PermissionEnum.READ_EMPLOYEE,
      PermissionEnum.CREATE_ATTENDANCE,
      PermissionEnum.READ_ATTENDANCE,
    ],
  },
};
