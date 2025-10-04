import { v4 as uuidv4 } from 'uuid';

export interface StoreMemberData {
    id: string;
    user_id: string;
    store_id: string;
    is_member_active: boolean;
    created_at: Date;
}

export class StoreMember {
    private constructor(
        private readonly id: string,
        private readonly user_id: string,
        private readonly store_id: string,
        private readonly is_member_active: boolean,
        private readonly created_at: Date,
    ) {}

    static create(data: Omit<StoreMemberData, 'id' | 'created_at' | 'is_member_active'>): StoreMember {
        return new StoreMember(
            uuidv4().split('-')[4],
            data.user_id,
            data.store_id,
            true,
            new Date(),
        );
    }

    toPrimitive(): StoreMemberData {
        return {
            id: this.id,
            user_id: this.user_id,
            store_id: this.store_id,
            is_member_active: this.is_member_active,
            created_at: this.created_at,
        };
    }

    static fromPrimitive(data: StoreMemberData): StoreMember {
        return new StoreMember(
            data.id,
            data.user_id,
            data.store_id,
            data.is_member_active,
            data.created_at,
        );
    }

    getId(): string {
        return this.id;
    }

    getUserId(): string {
        return this.user_id;
    }

    getStoreId(): string {
        return this.store_id;
    }

    getIsActive(): boolean {
        return this.is_member_active;
    }

    getCreatedAt(): Date {
        return this.created_at;
    }
}
