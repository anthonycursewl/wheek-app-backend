import { Inject, Injectable } from "@nestjs/common";
import { PRODUCT_REPOSITORY, ProductRepository } from "../../domain/repos/product.repository";
import { Product, ProductPrimitive } from "../../domain/entities/product.entity";
import { Result, success, failure } from "@/src/contexts/shared/ROP/result";

@Injectable()
export class UpdateProductUseCase {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository
    ) {}

    async execute(productData: ProductPrimitive, user_id: string): Promise<Result<Product, Error>> {
        try {
            const product = Product.update(productData);
            const updated = await this.productRepository.update(product);
            return success(updated);
        } catch (error) {
            return failure(error as Error);
        }
    }
}
