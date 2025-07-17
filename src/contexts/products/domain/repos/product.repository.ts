import { Product } from "../entities/product.entity";

export interface ProductRepository {
    create(product: Product): Promise<Product>
}

export const PRODUCT_REPOSITORY = Symbol('ProductRepository')