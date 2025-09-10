import { Permission } from "@/src/contexts/users/domain/entitys/permission.entity";

export interface PermissionRepository {
    findAllPermissions(): Promise<Permission[]>;
    assignPermissions(role_id: string, permissions: { id: string }[]): Promise<void>;
    getAllPermissionsIds(permissions: string[]): Promise<{ id: string }[]>;
}

export const PERMISSION_REPOSITORY = Symbol('PermissionRepository');
