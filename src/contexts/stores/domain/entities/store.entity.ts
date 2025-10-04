import { v4 as uuidv4 } from 'uuid';

export interface StoreData {
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: Date;
    owner: string; 
}

export class Store {
    private constructor(
        private readonly id: string,
        private readonly name: string,
        private readonly description: string | null,
        private readonly is_active: boolean,
        private readonly created_at: Date,
        private readonly owner: string, 
    ) {}

    static create(data: Omit<StoreData, 'id' | 'created_at' | 'is_active'>): Store {
        return new Store(
            uuidv4(),
            data.name,
            data.description || null,
            true,
            new Date(),
            data.owner
        );
    }

    /**
     * Returns the store data as a primitive object.
     * @returns The store data as a primitive object.
     */
    toPrimitive(): StoreData {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            is_active: this.is_active,
            created_at: this.created_at,
            owner: this.owner,
        };
    }

    /**
     * Creates a new store from a primitive object.
     * @param data The primitive object to create the store from.
     * @returns The created store.
     */
    static fromPrimitive(data: StoreData): Store {
        return new Store(
            data.id,
            data.name,
            data.description,
            data.is_active,
            data.created_at,
            data.owner
        );
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getDescription(): string | null {
        return this.description;
    }

    getIsActive(): boolean {
        return this.is_active;
    }

    getCreatedAt(): Date {
        return this.created_at;
    }

    getOwner(): string {
        return this.owner;
    }
}