import { Permission } from "@/src/contexts/users/domain/entitys/permission.entity";

export interface PermissionRepository {
    findAllPermissions(): Promise<Permission[]>;
    getAllPermissionsIds(permissions: string[]): Promise<{ id: string }[]>;
}

export const PERMISSION_REPOSITORY = Symbol('PermissionRepository');
