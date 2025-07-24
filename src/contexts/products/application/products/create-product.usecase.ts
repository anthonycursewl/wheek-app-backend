import { Inject, Injectable } from "@nestjs/common";
import { PRODUCT_REPOSITORY, ProductRepository } from "../../domain/repos/product.repository";
import { Product, CreateProductData, ProductPrimitive } from "../../domain/entities/product.entity";
import { Result, success, failure } from "@shared/ROP/result";

@Injectable()
export class CreateProductUseCase {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository
    ) {}

    async execute(productData: Omit<ProductPrimitive, 'created_at'>): Promise<Result<Product, Error>> {
        try {
            const product = Product.create({
                ...productData,
                w_ficha: productData.w_ficha ? {
                    condition: productData.w_ficha.condition,
                    cost: productData.w_ficha.cost,
                    benchmark: productData.w_ficha.benchmark,
                    tax: productData.w_ficha.tax
                } : null,
            });
            
            const created = await this.productRepository.create(product);
            return success(created);
        } catch (error) {
            return failure(error as Error);
        }
    }
}
