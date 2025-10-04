import { v4 as uuidv4 } from "uuid";

export interface ProviderPrimitives {
    id: string;
    name: string;
    description?: string | null;
    store_id: string;
    created_at: Date;
    deleted_at: Date | null;
    updated_at: Date | null;
    contact_phone: string;
    contact_email: string;
    is_active: boolean | null;
}

export class Provider {
    private readonly id: string;
    private readonly name: string;
    private readonly description: string | null;
    private readonly store_id: string;
    private readonly created_at: Date;
    private readonly deleted_at: Date | null;
    private readonly updated_at: Date | null;
    private readonly contact_phone: string;
    private readonly contact_email: string;
    private readonly is_active: boolean | null; 

    get is_active_status(): boolean | null {
        return this.is_active;
    }

    constructor(
        id: string,
        name: string,
        description: string | null,
        store_id: string,
        created_at: Date,
        deleted_at: Date | null,
        updated_at: Date | null,
        contact_phone: string,
        contact_email: string,
        is_active: boolean | null
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.store_id = store_id;
        this.created_at = created_at;
        this.contact_phone = contact_phone;
        this.contact_email = contact_email;
        this.is_active = is_active;
    }

    public static create(data: Omit<ProviderPrimitives, 'id' | 'created_at' | 'deleted_at' | 'updated_at'>): Provider {
        const providerId = uuidv4();
        return new Provider(
            providerId,
            data.name.trim(),
            data.description?.trim() || null,
            data.store_id,
            new Date(),
            null,
            new Date(),
            data.contact_phone.trim(),
            data.contact_email.trim(),
            data.is_active
        );
    }

    public static update(id: string, data: Omit<ProviderPrimitives, 'id' | 'updated_at' | 'deleted_at' | 'created_at'>): Provider {
        return new Provider(
            id,
            data.name.trim(),
            data.description?.trim() || null,
            data.store_id,
            new Date(),
            null,
            new Date(),
            data.contact_phone.trim(),
            data.contact_email.trim(),
            data.is_active
        );
    }

    public static delete(data: ProviderPrimitives): Provider {
        return new Provider(
            data.id,
            data.name.trim(),
            data.description?.trim() || null,
            data.store_id,
            data.created_at,
            new Date(),
            null,
            data.contact_phone.trim(),
            data.contact_email.trim(),
            data.is_active
        )
    }

    toPrimitives(): ProviderPrimitives {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            store_id: this.store_id,
            created_at: this.created_at,
            deleted_at: this.deleted_at,
            updated_at: this.updated_at,
            contact_phone: this.contact_phone,
            contact_email: this.contact_email,
            is_active: this.is_active,
        };
    }

    public static fromPrimitives(primitives: ProviderPrimitives): Provider {
        return new Provider(
            primitives.id,
            primitives.name,
            primitives.description || null,
            primitives.store_id,
            primitives.created_at,
            primitives.deleted_at,
            primitives.updated_at,
            primitives.contact_phone,
            primitives.contact_email,
            primitives.is_active
        );
    }
}
