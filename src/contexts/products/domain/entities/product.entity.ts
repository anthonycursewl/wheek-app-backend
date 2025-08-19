import { Ficha, FichaPrimitive } from './ficha.entity';

export interface ProductPrimitive {
    id: string;
    barcode: string;
    name: string;
    store_id: string;
    created_at: Date;
    provider_id: string;
    category_id: string;
    w_ficha: FichaPrimitive;
}

export interface CreateProductData extends Omit<ProductPrimitive, 'created_at' | 'id' | 'w_ficha'> {
    w_ficha: Omit<FichaPrimitive, 'id' | 'product_id'>;
}

export class Product {
    private readonly id: string;
    private readonly barcode: string;
    private readonly name: string;
    private readonly store_id: string;
    
    get storeId(): string {
        return this.store_id;
    }
    private readonly created_at: Date;
    private readonly provider_id: string;
    private readonly category_id: string;
    private readonly w_ficha: Ficha;

    private constructor(
        id: string, 
        barcode: string, 
        name: string, 
        store_id: string, 
        created_at: Date, 
        provider_id: string,
        category_id: string,
        w_ficha: Ficha
    ) {
        this.id = id;
        this.barcode = barcode;
        this.name = name;
        this.store_id = store_id;
        this.created_at = created_at;
        this.provider_id = provider_id;
        this.category_id = category_id;
        this.w_ficha = w_ficha;
    }
    
    /**
     * @params data: CreateProductData
     * 
     * Factory method to create a new Product aggregate with optional ficha
     */
    static create(data: CreateProductData): Product {
        const createdAt = new Date();
        
        const ficha = Ficha.create(data.w_ficha);

        return new Product(
            this.generateEAN13Barcode(),
            data.barcode,
            data.name,
            data.store_id,
            createdAt,
            data.provider_id,
            data.category_id,
            ficha
        );
    }

    /**
     * @params data: UpdateProductData
     * 
     * Factory method to update an existing Product aggregate
     */
    static update(data: ProductPrimitive): Product {
        return new Product(
            data.id,
            data.barcode,
            data.name,
            data.store_id,
            data.created_at,
            data.provider_id,   
            data.category_id,
            Ficha.update(data.w_ficha) 
        );
    }
    
    /**
     * Reconstructs the aggregate from primitive data
     */
    static fromPrimitive(primitive: ProductPrimitive): Product {
        const product = new Product(
            primitive.id,
            primitive.barcode,
            primitive.name,
            primitive.store_id,
            primitive.created_at,
            primitive.provider_id,
            primitive.category_id,
            primitive.w_ficha ? Ficha.fromPrimitive(primitive.w_ficha) : Ficha.create({
                condition: '',
                cost: 0,
                benchmark: 0,
                tax: false,
                product_id: primitive.id
            })
        );
        
        return product;
    }

    /**
     * Returns the primitive data of the aggregate
     * The repository will use this to persist the data
     */
    public toPrimitive(): ProductPrimitive {
        return {
            id: this.id,
            barcode: this.barcode,
            name: this.name,
            store_id: this.store_id,
            created_at: this.created_at,
            provider_id: this.provider_id,
            category_id: this.category_id,
            w_ficha: this.w_ficha.toPrimitive()
        };
    }
    
    private static generateEAN13Barcode(): string {
        let base12 = '';
        for (let i = 0; i < 12; i++) { base12 += Math.floor(Math.random() * 10); }
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(base12[i]) * ((i % 2 === 0) ? 1 : 3);
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        return base12 + checkDigit.toString();
    }
}