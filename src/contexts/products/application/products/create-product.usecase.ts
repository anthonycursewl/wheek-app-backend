import { Inject, Injectable } from "@nestjs/common";
import { PRODUCT_REPOSITORY, ProductRepository } from "../../domain/repos/product.repository";
import { Product, CreateProductData } from "../../domain/entities/product.entity";
import { Result, success, failure } from "@shared/ROP/result";

@Injectable()
export class CreateProductUseCase {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository
    ) {}

    async execute(productData: CreateProductData): Promise<Result<Product, Error>> {
        try {
            const product = Product.create(productData);
            
            const created = await this.productRepository.create(product);
            return success(created);
        } catch (error) {
            return failure(error as Error);
        }
    }
}
