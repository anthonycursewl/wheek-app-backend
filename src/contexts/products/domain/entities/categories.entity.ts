import { randomUUID } from "crypto";

export interface CategoryPrimitives {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
    store_id: string;
}

export class Category {
    private readonly id: string;
    private readonly name: string;
    private readonly created_at: Date;
    private readonly updated_at: Date;
    private readonly store_id: string;

    private constructor(
        id: string,
        name: string,
        created_at: Date,
        updated_at: Date,
        store_id: string
    ) {
        this.id = id;
        this.name = name;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.store_id = store_id;
    }

    public static create(data: Omit<CategoryPrimitives, 'id' | 'created_at' | 'updated_at'>): Category {
        const categoryId = randomUUID();
        return new Category(
            categoryId,
            data.name,
            new Date(),
            new Date(),
            data.store_id
        );
    }

    public update(data: Omit<CategoryPrimitives, 'id' | 'created_at' | 'updated_at'>): Category {
        return new Category(
            this.id,
            data.name,
            this.created_at,
            new Date(),
            data.store_id
        );
    }

    public toPrimitives(): CategoryPrimitives {
        return {
            id: this.id,
            name: this.name,
            created_at: this.created_at,
            updated_at: this.updated_at,
            store_id: this.store_id,
        };
    }

    public static fromPrimitives(primitives: CategoryPrimitives): Category {
        return new Category(
            primitives.id,
            primitives.name,
            primitives.created_at,
            primitives.updated_at,
            primitives.store_id
        );
    }
}