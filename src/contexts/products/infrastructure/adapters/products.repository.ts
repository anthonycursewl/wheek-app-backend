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
                    ...productPrimitive,
                    w_ficha: {
                        create: {
                            ...productPrimitive.w_ficha,
                            cost: new Prisma.Decimal(productPrimitive.w_ficha.cost),
                            benchmark: new Prisma.Decimal(productPrimitive.w_ficha.benchmark),
                        }
                    }
                },
                include: {
                    w_ficha: true
                }
            }) as ProductWithFicha;

            if (!createdProduct.w_ficha) {
                throw new Error('Ficha is required but was not created');
            }

            const primitiveForDomain: ProductPrimitive = {
                ...createdProduct,
                w_ficha: {
                    ...createdProduct.w_ficha,
                    cost: Number(createdProduct.w_ficha.cost),
                    benchmark: Number(createdProduct.w_ficha.benchmark),
                }
            };

            return Product.fromPrimitive(primitiveForDomain);
        });
    }
}