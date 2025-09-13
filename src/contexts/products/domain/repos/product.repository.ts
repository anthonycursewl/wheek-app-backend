import { Product, ProductSearchResult } from "../entities/product.entity";

export interface ProductRepository {
    create(product: Product): Promise<Product>
    getAll(store_id: string, skip: number, take: number): Promise<Product[] | []>
    update(product: Product): Promise<Product>
    delete(id: string): Promise<Product | null>
    findById(id: string): Promise<Product | null>
    search(store_id: string, q: string): Promise<ProductSearchResult[] | []>
}

export const PRODUCT_REPOSITORY = Symbol('ProductRepository')