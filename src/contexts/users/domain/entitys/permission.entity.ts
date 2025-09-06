export interface PermissionPrimitive {
    id: string;
    action: string;
    resource: string;
    description: string | null;
}

export class Permission {
    private constructor(
        public readonly id: string,
        public readonly action: string,
        public readonly resource: string,
        public readonly description: string | null,
    ) {}

    static create(id: string, action: string, resource: string, description: string | null): Permission {
        return new Permission(id, action, resource, description);
    }

    static fromPrimitives(data: PermissionPrimitive): Permission {
        return new Permission(
            data.id,
            data.action,
            data.resource,
            data.description
        );
    }

    toPrimitive(): PermissionPrimitive {
        return {
            id: this.id,
            action: this.action,
            resource: this.resource,
            description: this.description,
        };
    }
}
