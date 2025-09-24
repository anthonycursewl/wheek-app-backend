export class AdjustmentItem {
    id?: string;
    adjustment_id: string;
    product_id: string;
    quantity: number;
}

export class Adjustment {
    id?: string;
    store_id: string;
    user_id: string;
    adjustment_date: Date;
    reason: string;
    notes: string;
    created_at?: Date;
    updated_at?: Date;
    items: AdjustmentItem[];
}

export class AdjustmentWithDetails {
    id: string;
    notes?: string;
    store_id: string;
    adjustment_date: Date;
    reason: string;
    user: {
        name: string;
    }
    items: {
        quantity: number;
        product: {
            name: string;
            w_ficha: {
                condition: string;
                cost: number;
                benchmark: number;
                tax: boolean;
            }
        }
    }[];
}
