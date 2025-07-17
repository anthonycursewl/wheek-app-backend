import { randomUUID } from "crypto";

export interface ProviderPrimitives {
    id: string;
    name: string;
    description?: string | null;
    store_id: string;
    created_at: Date;
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
    private readonly contact_phone: string;
    private readonly contact_email: string;
    private readonly is_active: boolean | null; 

    constructor(
        id: string,
        name: string,
        description: string | null,
        store_id: string,
        created_at: Date,
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

    public static create(data: Omit<ProviderPrimitives, 'id' | 'created_at'>): Provider {
        const providerId = randomUUID();
        return new Provider(
            providerId,
            data.name,
            data.description || null,
            data.store_id,
            new Date(),
            data.contact_phone,
            data.contact_email,
            data.is_active
        );
    }

    public update(data: Omit<ProviderPrimitives, 'id' | 'created_at'>): Provider {
        return new Provider(
            this.id,
            data.name,
            data.description || null,
            data.store_id,
            new Date(),
            data.contact_phone,
            data.contact_email,
            data.is_active
        );
    }

    toPrimitives(): ProviderPrimitives {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            store_id: this.store_id,
            created_at: this.created_at,
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
            primitives.contact_phone,
            primitives.contact_email,
            primitives.is_active
        );
    }
}