import { Injectable } from "@nestjs/common";
import { ProductRepository } from "../../domain/repos/product.repository";
import { PrismaService } from "@/src/contexts/shared/persistance/prisma.service";
import { Product, ProductPrimitive } from "../../domain/entities/product.entity";
import { Prisma } from "@prisma/client";

type ProductWithFicha = Prisma.productsGetPayload<{
    include: { w_ficha: true };
}>;

@Injectable()
export class ProductRepositoryAdapter implements ProductRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(product: Product): Promise<Product> {
        const productPrimitive = product.toPrimitive();

        return this.prisma.$transaction(async (prisma) => {
            const createdProduct = await prisma.products.create({
                data: {
                    id: productPrimitive.id,
                    barcode: productPrimitive.barcode,
                    name: productPrimitive.name,
                    store_id: productPrimitive.store_id,
                    provider_id: productPrimitive.provider_id,
                    category_id: productPrimitive.category_id,
                    created_at: productPrimitive.created_at,
                    w_ficha: productPrimitive.w_ficha ? {
                        create: {
                            id: productPrimitive.w_ficha.id,
                            condition: productPrimitive.w_ficha.condition,
                            cost: new Prisma.Decimal(productPrimitive.w_ficha.cost),
                            benchmark: new Prisma.Decimal(productPrimitive.w_ficha.benchmark),
                            tax: productPrimitive.w_ficha.tax,
                        }
                    } : undefined
                },
                include: {
                    w_ficha: true
                }
            }) as ProductWithFicha;

            const primitiveForDomain: ProductPrimitive = {
                ...createdProduct,
                w_ficha: createdProduct.w_ficha ? {
                    id: createdProduct.w_ficha.id,
                    condition: createdProduct.w_ficha.condition,
                    cost: Number(createdProduct.w_ficha.cost),
                    benchmark: Number(createdProduct.w_ficha.benchmark),
                    tax: createdProduct.w_ficha.tax,
                    product_id: createdProduct.id
                } : null
            };

            return Product.fromPrimitive(primitiveForDomain);
        });
    }
}