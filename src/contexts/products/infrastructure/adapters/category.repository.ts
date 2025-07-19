import { Injectable, NotImplementedException } from "@nestjs/common";
import { Category } from "../../domain/entities/categories.entity";
import { CategoryRepository } from "../../domain/repos/category.repository";
import { PrismaService } from "@/src/contexts/shared/persistance/prisma.service";

@Injectable()
export class CategoryRepositoryAdapter implements CategoryRepository {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async save(category: Category): Promise<Category> {

        const categoryPrimitives = category.toPrimitives()
        const createdCategory = await this.prisma.categories.upsert({
            where: {
                id: categoryPrimitives.id
            },
            create: categoryPrimitives,
            update: {
                name: categoryPrimitives.name,
                updated_at: new Date()
            }
        })

        return Category.fromPrimitives(createdCategory)
    }

    async findAllByStoreId(storeId: string, skip: number, take: number): Promise<Category[]> {
        const categories = await this.prisma.categories.findMany({
            where: {
                store_id: storeId,
            },
            skip,
            take,
            orderBy: {
                created_at: 'desc'
            }
        })

        return categories.map(category => Category.fromPrimitives(category))
    }
}