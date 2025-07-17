import { randomUUID } from 'crypto';

export interface FichaPrimitive {
    id: string;
    condition: string;
    cost: number;
    benchmark: number;
    tax: boolean;
    product_id: string;
}

export type CreateFichaData = Omit<FichaPrimitive, 'id' | 'product_id'> & {
    product_id?: string;
};

export class Ficha {
    private readonly id: string;
    private readonly condition: string;
    private readonly cost: number;
    private readonly benchmark: number;
    private readonly tax: boolean;
    private readonly product_id: string | undefined;

    private constructor(
        id: string, 
        condition: string, 
        cost: number, 
        benchmark: number, 
        tax: boolean,
        product_id?: string
    ) {
        this.id = id;
        this.condition = condition;
        this.cost = cost;
        this.benchmark = benchmark;
        this.tax = tax;
        this.product_id = product_id;
    }

    /**
     * Factory method to create a new Ficha instance
     */
    public static create(data: CreateFichaData): Ficha {
        const fichaId = randomUUID();
        return new Ficha(
            fichaId,
            data.condition,
            data.cost,
            data.benchmark,
            data.tax,
            data.product_id
        );
    }

    /**
     * Factory method to reconstruct a Ficha entity from primitive data
     */
    public static fromPrimitive(primitive: FichaPrimitive): Ficha {
        if (!primitive.product_id) {
            throw new Error('Cannot create Ficha without product_id');
        }
        
        return new Ficha(
            primitive.id,
            primitive.condition,
            primitive.cost,
            primitive.benchmark,
            primitive.tax,
            primitive.product_id
        );
    }

    /**
     * Converts the entity to a primitive object
     * @throws Error if product_id is not set
     */
    public toPrimitive(): FichaPrimitive {
        if (!this.product_id) {
            throw new Error('Cannot convert Ficha to primitive without product_id');
        }
        
        return {
            id: this.id,
            condition: this.condition,
            cost: this.cost,
            benchmark: this.benchmark,
            tax: this.tax,
            product_id: this.product_id
        };
    }
    
    /**
     * Updates the product_id of the ficha
     * Returns a new instance with the updated product_id
     */
    public withProductId(productId: string): Ficha {
        return new Ficha(
            this.id,
            this.condition,
            this.cost,
            this.benchmark,
            this.tax,
            productId
        );
    }
}