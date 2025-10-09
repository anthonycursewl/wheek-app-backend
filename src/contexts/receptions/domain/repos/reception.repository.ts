export enum ReceptionStatus {
    COMPLETED,
    CANCELLED
}

interface ReceptionItem {
    product_id: string;
    quantity: number;
    cost_price: number;
}

export interface Reception {
    id: string;
    store_id: string;
    user_id: string;
    provider_id: string | null;
    notes: string | null;
    items: ReceptionItem[];
}

export interface ReceptionsWithItems {
    id: string;
    notes: string | null;
    is_active: boolean;
    items: {
        quantity: number;
        cost_price: number;
        product: {
            name: string;
        };
    }[];
    reception_date: Date;
    status: string;
    user: {
        name: string;
    };
    provider: {
        name: string;
    } | null;
}

export interface ReceptionWithStore extends ReceptionsWithItems {
    store: {
        name: string;
    };
}

export interface ReceptionRepository {
    create(reception: Omit<Reception, 'id'>): Promise<ReceptionsWithItems>;
    delete(id: string, isSoftDelete: boolean): Promise<ReceptionsWithItems>;
    getAll(store_id: string, skip: number, take: number, filters: any): Promise<ReceptionsWithItems[]>;
    getReceptionById(id: string): Promise<ReceptionWithStore>;
    getReceptionsByDateRange(store_id: string, start_date: Date, end_date: Date): Promise<ReceptionWithStore[] | []>;
}

export const RECEPTION_REPOSITORY = Symbol('ReceptionRepository');