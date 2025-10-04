import { Role, RolePrimitive } from "@/src/contexts/users/domain/entitys/role.entity";

export interface RoleWithPermissions {
    id: string;
    name: string;
    description?: string | null;
    is_active: boolean;
    created_at: Date;
    permissions: Array<{
        permission: {
            resource: string;
            action: string;
        }
    }>;
}


export interface RoleAllData {
    id: string;
    name: string;
    description?: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date | null;
    store_id: string;
    deleted_at: Date | null;
    permissions: Array<{
        permission: {
            resource: string;
            action: string;
        }
    }>;
}

export interface RoleRepository {
    create(role: Role): Promise<Role>;
    update(id: string, store_id: string, role: Role): Promise<RoleWithPermissions>;
    findAllByStoreId(store_id: string, skip: number, take: number): Promise<RoleWithPermissions[]>;
    assignPermissions(role_id: string, permissions: { id: string }[]): Promise<RoleWithPermissions>;
    findUnique(id: string): Promise<RoleAllData>;
    findById(id: string, store_id: string): Promise<RolePrimitive | null>;
}

export const ROLE_REPOSITORY = Symbol('RoleRepository');
