import { randomUUID } from "crypto";

export interface CategoryPrimitives {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
    store_id: string;
    is_active: boolean;
}

export class Category {
    private readonly id: string;
    private readonly name: string;
    private readonly created_at: Date;
    private readonly updated_at: Date;
    private readonly store_id: string;
    private readonly is_active: boolean;

    private constructor(
        id: string,
        name: string,
        created_at: Date,
        updated_at: Date,
        store_id: string,
        is_active: boolean = true
    ) {
        this.id = id;
        this.name = name;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.store_id = store_id;
        this.is_active = is_active;
    }

    public static create(data: Omit<CategoryPrimitives, 'id' | 'created_at' | 'updated_at'>): Category {
        const categoryId = randomUUID();
        return new Category(
            categoryId,
            data.name.trim(),
            new Date(),
            new Date(),
            data.store_id,
            data.is_active ?? true
        );
    }

    public static update(data: Omit<CategoryPrimitives, 'updated_at'>): Category {
        return new Category(
            data.id,
            data.name.trim(),
            data.created_at,
            new Date(),
            data.store_id,
            data.is_active
        );
    }

    public toPrimitives(): CategoryPrimitives {
        return {
            id: this.id,
            name: this.name,
            created_at: this.created_at,
            updated_at: this.updated_at,
            store_id: this.store_id,
            is_active: this.is_active,
        };
    }

    public static fromPrimitives(primitives: CategoryPrimitives): Category {
        return new Category(
            primitives.id,
            primitives.name,
            primitives.created_at,
            primitives.updated_at,
            primitives.store_id,
            primitives.is_active
        );
    }
}