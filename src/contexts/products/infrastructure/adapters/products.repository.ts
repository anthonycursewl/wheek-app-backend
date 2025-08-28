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
        const { w_ficha, ...productData } = product.toPrimitive();

        return this.prisma.$transaction(async (prisma) => {
            const createdProduct = await prisma.products.create({
                data: {
                    ...productData,
                    w_ficha: {
                        create: {
                            id: w_ficha.id,
                            condition: w_ficha.condition,
                            cost: new Prisma.Decimal(w_ficha.cost),
                            benchmark: new Prisma.Decimal(w_ficha.benchmark),
                            tax: w_ficha.tax
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

    async getAll(store_id: string, skip: number, take: number): Promise<Product[] | []> {
        const products = await this.prisma.products.findMany({
            where: {
                store_id
            },
            skip,
            take,
            include: {
                w_ficha: true
            },
            orderBy: {
                created_at: 'desc'
            }
        }) as ProductWithFicha[];

        return products.map(product => {
            const primitiveForDomain: ProductPrimitive = {
                ...product,
                w_ficha: product.w_ficha ? {
                    ...product.w_ficha,
                    cost: Number(product.w_ficha.cost),
                    benchmark: Number(product.w_ficha.benchmark),
                } : {
                    id: '',
                    condition: '',
                    cost: 0,
                    benchmark: 0,
                    tax: false,
                    product_id: ''
                }
            };

            return Product.fromPrimitive(primitiveForDomain);
        });
    }

    async update(product: Product): Promise<Product> {
        const { w_ficha, ...productData } = product.toPrimitive();

        const updated = await this.prisma.products.update({
            where: {
                id: productData.id
            },
            data: {
                name: productData.name,
                barcode: productData.barcode,
                provider_id: productData.provider_id,
                category_id: productData.category_id,
                store_id: productData.store_id,
                w_ficha: {
                    update: {
                        condition: w_ficha.condition,
                        cost: new Prisma.Decimal(w_ficha.cost),
                        benchmark: new Prisma.Decimal(w_ficha.benchmark),
                        tax: w_ficha.tax   
                    }
                }
            },
            include: {
                w_ficha: true
            }
        })

        return Product.fromPrimitive({
            ...updated,
            w_ficha: updated.w_ficha ? {
                ...updated.w_ficha,
                cost: Number(updated.w_ficha.cost),
                benchmark: Number(updated.w_ficha.benchmark),
            } : {
                id: '',
                condition: '',
                cost: 0,
                benchmark: 0,
                tax: false,
                product_id: ''
            }
        })
    }

    async findById(id: string): Promise<Product | null> {
        const product = await this.prisma.products.findUnique({
            where: { id },
            include: { w_ficha: true }
        }) as ProductWithFicha | null;

        if (!product) return null;

        const primitiveForDomain: ProductPrimitive = {
            ...product,
            w_ficha: product.w_ficha ? {
                ...product.w_ficha,
                cost: Number(product.w_ficha.cost),
                benchmark: Number(product.w_ficha.benchmark),
            } : {
                id: '',
                condition: '',
                cost: 0,
                benchmark: 0,
                tax: false,
                product_id: ''
            }
        };

        return Product.fromPrimitive(primitiveForDomain);
    }

    async delete(id: string): Promise<Product | null> {
        const product = await this.findById(id);
        if (!product) return null;

        await this.prisma.products.update({
            where: { id },
            data: {
                is_active: false,
                deleted_at: new Date()
            }
        });

        return product;
    }
}