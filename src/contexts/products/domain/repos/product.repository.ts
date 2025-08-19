import { Product } from "../entities/product.entity";

export interface ProductRepository {
    create(product: Product): Promise<Product>
    getAll(store_id: string, skip: number, take: number): Promise<Product[] | []>
    update(product: Product): Promise<Product>
    isMember(store_id: string, user_id: string): Promise<boolean>
    delete(id: string): Promise<Product | null>
    findById(id: string): Promise<Product | null>
}

export const PRODUCT_REPOSITORY = Symbol('ProductRepository')