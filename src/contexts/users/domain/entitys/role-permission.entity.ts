import { Permission, PermissionPrimitive } from './permission.entity';

export interface RolePermissionPrimitive {
    role_id: string;
    permission_id: string;
    permission?: PermissionPrimitive;
}

export class RolePermission {
    private constructor(
        public readonly role_id: string,
        public readonly permission_id: string,
        public readonly permission?: Permission,
    ) {}

    static create(role_id: string, permission_id: string, permission?: Permission): RolePermission {
        return new RolePermission(role_id, permission_id, permission);
    }

    static fromPrimitives(data: RolePermissionPrimitive): RolePermission {
        return new RolePermission(
            data.role_id,
            data.permission_id,
            data.permission ? Permission.fromPrimitives(data.permission) : undefined
        );
    }

    getRoleId(): string {
        return this.role_id;
    }

    getPermissionId(): string {
        return this.permission_id;
    }

    toPrimitive(): RolePermissionPrimitive {
        return {
            role_id: this.role_id,
            permission_id: this.permission_id,
            permission: this.permission?.toPrimitive(),
        };
    }
}