import { Store } from "@/src/contexts/stores/domain/entities/store.entity";
import { UserRole } from "./user-role.entity";
import { RolePermission, RolePermissionPrimitive } from "./role-permission.entity";

export interface RolePrimitive {
    id: string;
    name: string;
    store_id: string;
    description?: string;
    created_at: Date;
    updated_at?: Date;
    deleted_at?: Date;
    is_active: boolean;

    // relaciones
    store?: Store;
    permissions?: RolePermissionPrimitive[];
    user_roles?: UserRole[];
}

export class Role {
    private constructor(
        private readonly id: string,
        private name: string,
        private store_id: string,
        private readonly created_at: Date,
        private description?: string,
        private updated_at?: Date,
        private deleted_at?: Date,
        private is_active: boolean = true,

        // Relaciones
        private store?: Store,
        private permissions?: RolePermission[],
        private user_roles?: UserRole[],
    ) {}

    static create(data: Omit<RolePrimitive, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'store' | 'permissions' | 'user_roles' | 'is_active'>): Role {
        return new Role(
            crypto.randomUUID(),
            data.name,
            data.store_id,
            new Date(),
            data.description || '',
            undefined,
            undefined,
            true,
        );
    }

    static fromPrimitive(data: RolePrimitive): Role {
        return new Role(
            data.id,
            data.name,
            data.store_id,
            data.created_at,
            data.description,
            data.updated_at,
            data.deleted_at,
            data.is_active,

            // Relaciones
            data.store,
            data.permissions ? data.permissions.map(p => RolePermission.fromPrimitives(p)) : undefined,
            data.user_roles
        );
    }

    toPrimitive(): RolePrimitive {
        return {
            id: this.id,
            name: this.name,
            store_id: this.store_id,
            description: this.description,
            created_at: this.created_at,
            updated_at: this.updated_at,
            deleted_at: this.deleted_at,
            is_active: this.is_active,
            permissions: this.permissions?.map(p => p.toPrimitive()),
        };
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getStoreId(): string {
        return this.store_id;
    }

    getCreatedAt(): Date {
        return this.created_at;
    }

    getDescription(): string | undefined {
        return this.description;
    }

    getUpdatedAt(): Date | undefined {
        return this.updated_at;
    }

    getDeletedAt(): Date | undefined {
        return this.deleted_at;
    }

    getIsActive(): boolean {
        return this.is_active;
    }

    getStore(): Store | undefined {
        return this.store;
    }

    getPermissions(): RolePermission[] | undefined {
        return this.permissions;
    }

    getUserRoles(): UserRole[] | undefined {
        return this.user_roles;
    }
}
