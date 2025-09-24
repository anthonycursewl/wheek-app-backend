// Invitation entity based on Prisma schema
export interface Invitation {
    id: string;
    email: string;
    store_id: string;
    role_id: string;
    invited_by_id: string;
    token: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
    created_at: Date;
    expires_at: Date;
    invited_by: {
        id: string;
        name: string;
        last_name: string;
        username: string;
        email: string;
    };
    role: {
        id: string;
        name: string;
        description?: string;
    };
    store: {
        id: string;
        name: string;
        description?: string;
    };
}
