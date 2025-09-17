import { Inject, Injectable, UnauthorizedException, NotFoundException } from "@nestjs/common"
import { ProductRepository } from "../../domain/repos/product.repository"
import { failure, success, Result } from "@/src/contexts/shared/ROP/result";
import { Product } from "../../domain/entities/product.entity"
import { PRODUCT_REPOSITORY } from "../../domain/repos/product.repository"

@Injectable()
export class DeleteProductUseCase {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository
    ) {}

    async execute(id: string): Promise<Result<Product, Error>> {
        try {
            if (!id) throw new Error('Product ID is required')

            const product = await this.productRepository.findById(id);
            if (!product) {
                return failure(new NotFoundException('Product not found'));
            }

            const deletedProduct = await this.productRepository.delete(id);
            if (!deletedProduct) {
                return failure(new Error('Failed to delete product'));
            }

            return success(deletedProduct);
        } catch (error) {
            return failure(error instanceof Error ? error : new Error('An unexpected error occurred'));
        }
    }
}